import React from 'react';

interface UserCardReadOnlyProps {
  name: string;
}

export const UserCardReadOnly: React.FC<UserCardReadOnlyProps> = ({ name }) => {
  return (
    <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200">
      <h3 className="font-semibold text-gray-900 text-base">{name}</h3>
    </div>
  );
};
