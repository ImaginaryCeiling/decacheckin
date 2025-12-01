import React from 'react';

interface UserCardProps {
  name: string;
  id?: string;
}

export const UserCard: React.FC<UserCardProps> = ({ name, id }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow border border-gray-200 mb-2">
      <h3 className="font-medium text-gray-900">{name}</h3>
      {/* Hidden or small ID for debug if needed, but request says only names */}
      {/* <span className="text-xs text-gray-400">{id}</span> */}
    </div>
  );
};

