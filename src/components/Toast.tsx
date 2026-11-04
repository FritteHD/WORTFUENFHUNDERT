import React from 'react';

interface Props {
  message: string;
  visible: boolean;
}

export const Toast: React.FC<Props> = ({ message, visible }) => {
  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-300 pointer-events-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="bg-gray-900 text-white rounded-xl px-6 py-3 shadow-lg font-medium text-center max-w-sm whitespace-pre-wrap">
        {message}
      </div>
    </div>
  );
};
