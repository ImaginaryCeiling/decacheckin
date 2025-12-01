import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase Admin client is missing. Check SUPABASE_SECRET_KEY.');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Fetch ALL users (both present and not present)
    const { data: users, error } = await supabaseAdmin
      .from('User')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 });
    }

    return NextResponse.json(users || []);
  } catch (error) {
    console.error('Get all users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
