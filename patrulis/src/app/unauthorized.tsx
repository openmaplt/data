import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center py-24 px-4">
      <div className="text-center">
        <p className="text-5xl font-black text-slate-200">401</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-800">
          Reikalingas prisijungimas
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Šiam veiksmui atlikti turite būti prisijungę.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          Prisijungti
        </Link>
      </div>
    </div>
  );
}
