export type Status = 'CHECKED_IN' | 'CONFERENCE' | 'CHECKED_OUT';

export interface User {
  id: string;
  name: string;
  status: Status;
  last_scanned_at: string; // Supabase returns snake_case by default unless transformed
  present: boolean;
}

