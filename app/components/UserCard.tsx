'use client';

import React, { useState } from 'react';
import { mutate } from 'swr';

interface UserCardProps {
  name: string;
  id?: string;
  currentStatus: 'CHECKED_IN' | 'CONFERENCE' | 'CHECKED_OUT';
}

export const UserCard: React.FC<UserCardProps> = ({ name, id, currentStatus }) => {
  const [isChanging, setIsChanging] = useState(false);

  const handleStatusChange = async (newStatus: 'CHECKED_IN' | 'CONFERENCE' | 'CHECKED_OUT') => {
    if (!id || newStatus === currentStatus || isChanging) return;

    setIsChanging(true);
    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        mutate('/api/users');
      } else {
        const error = await res.json();
        console.error('Failed to update status:', error);
        alert(`Failed to update status: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Network error. Please try again.');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base">{name}</h3>
        </div>
        <div className="relative">
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value as 'CHECKED_IN' | 'CONFERENCE' | 'CHECKED_OUT')}
            disabled={isChanging}
            className="text-xs px-2 py-1 rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 cursor-pointer"
          >
            <option value="CHECKED_IN">✓ In</option>
            <option value="CONFERENCE">⚠ Off</option>
            <option value="CHECKED_OUT">✕ Out</option>
          </select>
        </div>
      </div>
    </div>
  );
};

