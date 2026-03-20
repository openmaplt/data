import Link from 'next/link';
import { logoutAction } from '@/lib/actions/auth';
import { isAuthenticated } from '@/lib/auth';
import { getUnapprovedCount } from '@/lib/data/changesets';

import NavLink from './NavLink';

export default async function Header() {
  const isAuth = await isAuthenticated();
  const unapprovedCount = await getUnapprovedCount();

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-12">
            <Link
              href="/"
              className="flex items-center space-x-2 shrink-0 group"
            >
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                P
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                Patrulis
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink href="/" className="text-sm flex items-center gap-2">
                Pakeitimų patvirtinimai
                {unapprovedCount > 0 && (
                  <span className="flex items-center justify-center min-w-4.5 h-4.5 px-1.5 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-sm ring-2 ring-white">
                    {unapprovedCount}
                  </span>
                )}
              </NavLink>
              <NavLink href="/klaidos" className="text-sm">
                Klaidos
              </NavLink>
              <NavLink href="/poi" className="text-sm">
                Lankytinų vietų pasikeitimai
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {isAuth ? (
              <div className="flex items-center space-x-4">
                <form action={logoutAction}>
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
