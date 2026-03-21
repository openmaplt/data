import { Check, ExternalLink, Mail, X } from 'lucide-react';
import DataTable, { type Column } from '@/components/DataTable';
import { updateUserStatus } from '@/lib/actions/users';
import { isAuthenticated } from '@/lib/auth';
import { getNewUsers, type OSUser } from '@/lib/data/users';

export default async function NaujokaiPage() {
  const users = await getNewUsers();
  const isAuth = await isAuthenticated();

  const columns: Column<OSUser>[] = [
    {
      header: 'Naudotojas',
      cell: (row) => (
        <a
          href={`https://www.openstreetmap.org/user/${row.userid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-semibold flex items-center gap-1.5"
        >
          {row.userid} <ExternalLink className="w-3 h-3 opacity-50" />
        </a>
      ),
    },
    {
      header: 'Pirmas pasirodymas',
      cell: (row) =>
        row.known_from ? new Date(row.known_from).toLocaleDateString() : '-',
      cellClassName: 'text-slate-500 tabular-nums',
    },
    {
      header: 'Paskutinis keitimas',
      cell: (row) =>
        row.last_edit ? new Date(row.last_edit).toLocaleDateString() : '-',
      cellClassName: 'text-slate-500 tabular-nums',
    },
    {
      header: 'Keitimų skaičius',
      key: 'lt_edit_count',
      cellClassName: 'font-mono font-bold text-slate-700',
      align: 'center',
    },
    {
      header: 'Būsena',
      cell: (row) => {
        if (row.send_message === 'N') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              <X className="w-3 h-3" /> Nereikia
            </span>
          );
        }
        if (row.send_message === 'I') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              <Check className="w-3 h-3" /> Išsiųsta
            </span>
          );
        }
        return (
          <a
            href={`https://www.openstreetmap.org/message/new/${row.userid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
          >
            <Mail className="w-3 h-3" /> Reikia išsiųsti
          </a>
        );
      },
    },
  ];

  if (isAuth) {
    columns.push({
      header: 'Veiksmai',
      align: 'right',
      cell: (row) => {
        if (row.send_message !== 'R') {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <form action={updateUserStatus.bind(null, row.userid, 'I')}>
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
              >
                Išsiųsta
              </button>
            </form>
            <form action={updateUserStatus.bind(null, row.userid, 'N')}>
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-md text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-600 hover:text-white transition-all cursor-pointer"
              >
                Nereikia
              </button>
            </form>
          </div>
        );
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Naujokai</h1>
          <p className="text-slate-500 mt-1">
            Naujai pasirodę OpenStreetMap naudotojai Lietuvoje.
          </p>
        </div>
        <div className="text-xs text-slate-400 italic">
          <a
            href="https://docs.google.com/document/d/1wg2mt-P1L655wmncpGGCZHISGnHr1d5AW-lCAfIY9vE/edit?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-600 hover:underline flex items-center gap-1"
          >
            <Mail className="w-3 h-3" /> Laiško tekstas
          </a>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        getRowKey={(row) => row.userid}
        emptyMessage="Šiuo metu naujų naudotojų nėra!"
        getRowClassName={() => 'bg-white hover:bg-slate-50/50'}
      />
    </div>
  );
}
