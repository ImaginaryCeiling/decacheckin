import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server misconfiguration: Missing Secret Key' }, { status: 500 });
    }

    const body = await request.json();
    const { users } = body;

    if (!Array.isArray(users)) {
      return NextResponse.json({ error: 'Expected "users" array' }, { status: 400 });
    }

    // Prepare data for upsert
    const rows = users.map((user: { id: string; name: string }) => ({
      id: String(user.id),
      name: user.name,
      // Default values handled by DB or explicit here if needed
      status: 'CHECKED_IN',
      last_scanned_at: new Date().toISOString() 
    }));

    const { data, error } = await supabaseAdmin
      .from('User')
      .upsert(rows, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Supabase seed error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data?.length || 0 });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
