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

    // Expected format: "2025/12/01 10:37:18 1210082"
    const parts = barcode.trim().split(/\s+/);
    
    if (parts.length < 3) {
      return NextResponse.json({ error: 'Invalid barcode content' }, { status: 400 });
    }

    const id = parts[parts.length - 1];

    // Check if user exists
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found in master list', id }, { status: 404 });
    }

    const now = new Date();
    const cutoffTime = getCutoffTime();
    
    let newStatus: Status;

    if (isBefore(now, cutoffTime)) {
      newStatus = 'CONFERENCE';
    } else {
      newStatus = 'CHECKED_OUT';
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('User')
      .update({
        status: newStatus,
        last_scanned_at: now.toISOString(),
      })
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
      action: newStatus === 'CONFERENCE' ? 'Moved to Conference' : 'Checked Out'
    });

  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
