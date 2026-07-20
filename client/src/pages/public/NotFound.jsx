import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-6xl">🔍</span>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-6">Page Not Found</h1>
      <p className="text-slate-600 mt-2 max-w-sm">
        We couldn&apos;t find the page you are looking for. It might have been moved or doesn&apos;t exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
      >
        Go Home
      </Link>
    </div>
  );
}
