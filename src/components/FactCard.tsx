import React from 'react';

export function FactCard({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full mb-2">{label}</span>
      <p className="text-gray-700">{text}</p>
    </div>
  );
}
