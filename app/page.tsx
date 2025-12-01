'use client';

import useSWR from 'swr';
import { ScannerListener } from './components/ScannerListener';
import { UserCard } from './components/UserCard';

// Define User interface matching Prisma model
interface User {
  id: string;
  name: string;
  status: 'CHECKED_IN' | 'CONFERENCE' | 'CHECKED_OUT';
  lastScannedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { data: users, error } = useSWR<User[]>('/api/users', fetcher, { 
    refreshInterval: 2000 // Poll every 2 seconds
  });

  if (error) return <div className="p-8 text-center text-red-500">Failed to load users. Check connection.</div>;
  if (!users) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

  const checkedIn = users.filter((u) => u.status === 'CHECKED_IN');
  const conference = users.filter((u) => u.status === 'CONFERENCE');
  const checkedOut = users.filter((u) => u.status === 'CHECKED_OUT');

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <ScannerListener />
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">DecaCheckin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Checked In */}
        <div className="bg-white p-4 rounded-xl shadow-md min-h-[60vh] flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold text-blue-600">Checked In</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{checkedIn.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {checkedIn.length === 0 && <p className="text-gray-400 text-center italic mt-10">No users</p>}
            {checkedIn.map((u) => (
              <UserCard key={u.id} name={u.name} id={u.id} />
            ))}
          </div>
        </div>

        {/* Column 2: Conference Property */}
        <div className="bg-white p-4 rounded-xl shadow-md min-h-[60vh] flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold text-green-600">Conference Property</h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{conference.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {conference.length === 0 && <p className="text-gray-400 text-center italic mt-10">No users</p>}
            {conference.map((u) => (
              <UserCard key={u.id} name={u.name} id={u.id} />
            ))}
          </div>
        </div>

        {/* Column 3: Checked Out */}
        <div className="bg-white p-4 rounded-xl shadow-md min-h-[60vh] flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold text-red-600">Checked Out</h2>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{checkedOut.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {checkedOut.length === 0 && <p className="text-gray-400 text-center italic mt-10">No users</p>}
            {checkedOut.map((u) => (
              <UserCard key={u.id} name={u.name} id={u.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
