'use client';

import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  noaccess: 'Jūsų OSM paskyra neturi prieigos prie šio įrankio.',
  invalid_state: 'Prisijungimo klaida — bandykite dar kartą.',
  token_failed: 'Nepavyko gauti prieigos rakto iš OSM — bandykite dar kartą.',
  user_failed: 'Nepavyko gauti vartotojo duomenų iš OSM — bandykite dar kartą.',
};

export default function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const osmUser = searchParams.get('user');

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Prisijunkite
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Prisijunkite per savo OpenStreetMap paskyrą
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm text-center font-medium">
            {ERROR_MESSAGES[error] ?? 'Įvyko klaida — bandykite dar kartą.'}
            {error === 'noaccess' && osmUser && (
              <p className="mt-1 text-rose-500 font-normal">
                OSM vartotojas:{' '}
                <span className="font-mono font-semibold">{osmUser}</span>
              </p>
            )}
          </div>
        )}

        <a
          href="/api/auth/login"
          className="group flex w-full items-center justify-center gap-3 py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/25"
        >
          <svg
            viewBox="0 0 256 256"
            className="w-5 h-5 fill-white"
            aria-hidden="true"
          >
            <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm71.87 144H152v-32h47.87a88.19 88.19 0 0 1 0 32ZM40.13 152H88v32H56.13a88.19 88.19 0 0 1-16-32Zm16-48H88V72h31.88a88 88 0 0 0-63.75 32ZM104 72h48v32h-48Zm64 0h15.87a88 88 0 0 0-63.75-32H136Zm15.87 112H152v24.35a88.27 88.27 0 0 0 27.87-24.35ZM136 208.35V184h16v24.35a88.27 88.27 0 0 1-16 0ZM104 184v24.35a88.27 88.27 0 0 1-16-24.35Zm-16 0H72.13A88.27 88.27 0 0 1 56.13 152H88Zm0-64H40.13a88.19 88.19 0 0 1 16-32H88Zm16 0v-32h48v32Zm64 0v-32h15.87a88 88 0 0 1 16 32Z" />
          </svg>
          Prisijungti per OpenStreetMap
        </a>
      </div>
    </div>
  );
}
