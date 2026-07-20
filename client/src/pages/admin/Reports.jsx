import React from 'react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">System Reports</h2>
        <p className="text-sm text-slate-600 mt-1">
          Audit logs, analytical reports, and dispute trends.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-300">
        <span className="text-4xl block mb-2">📊</span>
        No system reports available yet. Data points will register once activities commence.
      </div>
    </div>
  );
}
