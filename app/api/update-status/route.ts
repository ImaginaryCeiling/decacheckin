import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Status } from '@/lib/types';

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server misconfiguration: Missing Secret Key' }, { status: 500 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    if (!['CHECKED_IN', 'CONFERENCE', 'CHECKED_OUT'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Check if user exists and is present
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found', id }, { status: 404 });
    }

    if (!user.present) {
      return NextResponse.json({ error: 'User not present at conference', id }, { status: 403 });
    }

    // Update user status
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('User')
      .update({
        status: status as Status,
        last_scanned_at: new Date().toISOString(),
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
      message: `Status updated to ${status}`,
    });

  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
