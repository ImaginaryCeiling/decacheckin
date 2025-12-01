'use client';

import useSWR from 'swr';
import { UserCardReadOnly } from './components/UserCardReadOnly';

// Define User interface
interface User {
  id: string;
  name: string;
  status: 'CHECKED_IN' | 'CONFERENCE' | 'CHECKED_OUT';
  lastScannedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { data: users, error } = useSWR<User[]>('/api/users', fetcher, {
    refreshInterval: 30000, // Poll every 30 seconds
    revalidateOnFocus: true, // Refresh when window gains focus
    revalidateOnReconnect: true // Refresh when connection is restored
  });

  if (error) return <div className="p-8 text-center text-red-500">Failed to load users. Check connection.</div>;
  if (!users) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

  // Safety check if users is not an array (e.g. API error object)
  if (!Array.isArray(users)) {
    console.error('API returned non-array:', users);
    return <div className="p-8 text-center text-red-500">Error: Invalid data format from server. Check console.</div>;
  }

  const checkedIn = users.filter((u) => u.status === 'CHECKED_IN');
  const conference = users.filter((u) => u.status === 'CONFERENCE');
  const checkedOut = users.filter((u) => u.status === 'CHECKED_OUT');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-10">
      {/* Header */}
      <div className="max-w-[1800px] mx-auto mb-8">
        <div className="flex justify-between items-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">DecaCheckin Dashboard</h1>
            <p className="text-gray-500 text-sm">Real-time attendance tracking</p>
          </div>
        </div>
      </div>

      {/* Three Column Grid */}
      <div className="max-w-[1800px] mx-auto grid grid-cols-3 gap-6">
        {/* Column 1: Checked In */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 min-h-[70vh] flex flex-col hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-blue-100">
            <h2 className="text-2xl font-bold text-blue-600">Checked In</h2>
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
              {checkedIn.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {checkedIn.length === 0 && (
              <p className="text-gray-400 text-center italic mt-16 text-lg">No users checked in</p>
            )}
            {checkedIn.map((u) => (
              <UserCardReadOnly key={u.id} name={u.name} />
            ))}
          </div>
        </div>

        {/* Column 2: Off Conference Property */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 min-h-[70vh] flex flex-col hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-red-100">
            <h2 className="text-2xl font-bold text-red-600">Off Conference Property</h2>
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
              {conference.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {conference.length === 0 && (
              <p className="text-gray-400 text-center italic mt-16 text-lg">No users off conference property</p>
            )}
            {conference.map((u) => (
              <UserCardReadOnly key={u.id} name={u.name} />
            ))}
          </div>
        </div>

        {/* Column 3: Checked Out */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 min-h-[70vh] flex flex-col hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-purple-100">
            <h2 className="text-2xl font-bold text-purple-600">Checked Out</h2>
            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
              {checkedOut.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {checkedOut.length === 0 && (
              <p className="text-gray-400 text-center italic mt-16 text-lg">No users checked out</p>
            )}
            {checkedOut.map((u) => (
              <UserCardReadOnly key={u.id} name={u.name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
