import React from 'react';

interface UserCardProps {
  name: string;
  id?: string;
}

export const UserCard: React.FC<UserCardProps> = ({ name, id }) => {
  return (
    <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer">
      <h3 className="font-semibold text-gray-900 text-base">{name}</h3>
      {id && <span className="text-xs text-gray-400 mt-1 block">ID: {id}</span>}
    </div>
  );
};

