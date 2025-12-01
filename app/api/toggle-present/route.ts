import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server misconfiguration: Missing Secret Key' }, { status: 500 });
    }

    const body = await request.json();
    const { id, present } = body;

    if (!id || typeof present !== 'boolean') {
      return NextResponse.json({ error: 'Missing id or invalid present value' }, { status: 400 });
    }

    // Check if user exists
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found', id }, { status: 404 });
    }

    // Update user present status
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('User')
      .update({
        present: present,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update present status' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${present ? 'marked as present' : 'marked as not present'}`,
    });

  } catch (error) {
    console.error('Toggle present error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
