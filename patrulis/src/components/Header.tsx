import Link from 'next/link';
import { redirect } from 'next/navigation';
import { clearAuthSession, isAuthenticated } from '@/lib/auth';

export default async function Header() {
  const isAuth = await isAuthenticated();

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Patrulis
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuth ? (
              <div className="flex items-center space-x-4">
                <form
                  action={async () => {
                    'use server';
                    await clearAuthSession();
                    redirect('/');
                  }}
                >
                  <button
                    type="submit"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Atsijungti
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Prisijungti
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
