import Link from 'next/link';
import { logoutAction } from '@/lib/actions/auth';
import { isAuthenticated } from '@/lib/auth';
import { getUnapprovedCount } from '@/lib/data/changesets';
import { getErrorCount } from '@/lib/data/errors';
import { getPOICount } from '@/lib/data/poi';
import { getNewUsersCount } from '@/lib/data/users';

import MobileMenu from './MobileMenu';
import NavLink from './NavLink';

export default async function Header() {
  const isAuth = await isAuthenticated();
  const unapprovedCount = await getUnapprovedCount();
  const errorCount = await getErrorCount();
  const poiCount = await getPOICount();
  const newUserCount = await getNewUsersCount();

  const menuItems = [
    {
      name: 'Pakeitimų patvirtinimai',
      href: '/',
      count: unapprovedCount,
      color: 'bg-rose-500',
    },
    {
      name: 'Klaidos',
      href: '/klaidos',
      count: errorCount,
      color: 'bg-blue-500',
    },
    {
      name: 'Lankytinų vietų pasikeitimai',
      href: '/poi',
      count: poiCount,
      color: 'bg-indigo-500',
    },
    {
      name: 'Naujokai',
      href: '/naujokai',
      count: newUserCount,
      color: 'bg-amber-500',
    },
  ];

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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  className="text-sm flex items-center gap-2"
                >
                  {item.name}
                  {item.count > 0 && (
                    <span
                      className={`flex items-center justify-center min-w-4.5 h-4.5 px-1.5 text-[10px] font-bold text-white ${item.color} rounded-full shadow-sm ring-2 ring-white`}
                    >
                      {item.count}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <MobileMenu items={menuItems} />

            {isAuth ? (
              <div className="flex items-center space-x-4">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
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
