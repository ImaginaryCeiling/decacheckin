import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isBefore, set } from 'date-fns';
import { Status } from '@/lib/types';

// Helper to get cutoff time for today
function getCutoffTime() {
  const cutoffString = process.env.NEXT_PUBLIC_CHECKOUT_CUTOFF || '17:00';
  const [hours, minutes] = cutoffString.split(':').map(Number);
  
  const now = new Date();
  return set(now, { hours, minutes, seconds: 0, milliseconds: 0 });
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server misconfiguration: Missing Secret Key' }, { status: 500 });
    }

    const body = await request.json();
    const { barcode } = body;

    if (!barcode || typeof barcode !== 'string') {
      return NextResponse.json({ error: 'Invalid barcode format' }, { status: 400 });
    }

    // Expected formats:
    // Scanner: "2025/12/01 10:37:18 1210082" (date, time, ID)
    // Manual: "MANUAL 1210082" or just "1210082"
    const parts = barcode.trim().split(/\s+/);

    // Extract ID (always the last part)
    const id = parts[parts.length - 1];

    if (!id || id.length < 4) {
      return NextResponse.json({ error: 'Invalid ID in barcode' }, { status: 400 });
    }

    // Check if user exists and is present at the conference
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found in master list', id }, { status: 404 });
    }

    // Check if user is marked as present
    // if (!user.present) {
    //   return NextResponse.json({ error: 'User not present at conference', id, name: user.name }, { status: 403 });
    // }

    const now = new Date();
    const cutoffTime = getCutoffTime();
    const currentStatus = user.status as Status;

    let newStatus: Status;
    let action: string;

    // State transition logic:
    // CHECKED_IN -> CONFERENCE (before cutoff) or CHECKED_OUT (after cutoff)
    // CONFERENCE -> CHECKED_IN (return from conference)
    // CHECKED_OUT -> stays CHECKED_OUT (no change)

    if (currentStatus === 'CONFERENCE') {
      newStatus = 'CHECKED_IN';
      action = 'Returned to Checked In';
    } else if (currentStatus === 'CHECKED_OUT') {
      newStatus = 'CHECKED_OUT';
      action = 'Already Checked Out';
    } else {
      // currentStatus === 'CHECKED_IN'
      if (isBefore(now, cutoffTime)) {
        newStatus = 'CONFERENCE';
        action = 'Moved to Conference';
      } else {
        newStatus = 'CHECKED_OUT';
        action = 'Checked Out';
      }
    }

    // Update user
    const updateData: any = {
      status: newStatus,
      last_scanned_at: now.toISOString(),
    };

    if (!user.present) {
      updateData.present = true;
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('User')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      action
    });

  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
