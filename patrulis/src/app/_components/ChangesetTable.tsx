import { Check, Clock, ExternalLink, RotateCcw } from 'lucide-react';
import { approveChangeset, unapproveChangeset } from '@/app/actions';
import DataTable, { type Column } from '@/components/DataTable';
import { isAuthenticated } from '@/lib/auth';
import type { Changeset } from '@/lib/data/changesets';
import StatusIcon from './StatusIcon';

interface ChangesetTableProps {
  data: Changeset[];
  isApprovedTable: boolean;
}

function getRowStyle(valandu?: number) {
  if (valandu === undefined) return 'bg-white hover:bg-slate-50';
  if (valandu < 2) return 'bg-white';
  if (valandu < 3) return 'bg-slate-50';
  if (valandu < 4) return 'bg-slate-100';
  if (valandu < 5) return 'bg-slate-200';
  return 'bg-slate-300';
}

export default async function ChangesetTable({
  data,
  isApprovedTable,
}: ChangesetTableProps) {
  const isAuth = await isAuthenticated();

  const columns: Column<Changeset>[] = [
    {
      header: 'OSM pakeitimas',
      cell: (row) => (
        <a
          href={`http://www.openstreetmap.org/browse/changeset/${row.id}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
        >
          {row.id} <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
    {
      header: 'OSMHistory',
      cell: (row) =>
        row.didelis === 1 ? (
          <span className="text-slate-600">{row.id}</span>
        ) : (
          <a
            href={
              isApprovedTable
                ? `http://osmhistory.appspot.com/changeset/${row.id}`
                : `http://openmap-168413.ew.r.appspot.com/changeset/${row.id}`
            }
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            {row.id} <ExternalLink className="w-3 h-3" />
          </a>
        ),
    },
    {
      header: 'Naudotojas',
      key: 'user_name',
      cellClassName: 'font-medium text-slate-800',
    },
    {
      header: 'Komentaras',
      cell: (row) => (
        <div className="max-w-md truncate text-slate-600" title={row.comment}>
          {row.comment || (
            <span className="text-slate-400 italic">Nėra komentaro</span>
          )}
        </div>
      ),
    },
    {
      header: 'Ist',
      align: 'center',
      cell: (row) => <StatusIcon type="req" value={row.requested} />,
    },
    {
      header: 'Did',
      align: 'center',
      cell: (row) => <StatusIcon type="did" value={row.didelis} />,
    },
    {
      header: 'Užs',
      align: 'center',
      cell: (row) => <StatusIcon type="uzs" value={row.uzsienis} />,
    },
  ];

  if (isApprovedTable) {
    columns.push({
      header: 'Patvirtino',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-24 font-medium text-slate-800 truncate"
            title={row.approver || '[auto]'}
          >
            {row.approver || '[auto]'}
          </div>
          <div className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/80 flex items-center gap-1.5 shrink-0 shadow-sm">
            <Clock className="w-3 h-3 text-slate-400" /> {row.approve_time}
          </div>
        </div>
      ),
    });
  }

  if (isAuth) {
    columns.push({
      header: 'Veiksmas',
      align: 'right',
      cell: (row) => (
        <form
          action={
            isApprovedTable
              ? unapproveChangeset.bind(null, row.id)
              : approveChangeset.bind(null, row.id)
          }
        >
          <button
            type="submit"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none ${
              isApprovedTable
                ? 'text-rose-700 bg-rose-100 hover:bg-rose-200 focus:ring-rose-500/50'
                : 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:ring-emerald-500/50'
            }`}
          >
            {isApprovedTable ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" /> Atšaukti
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" /> Patvirtinti
              </>
            )}
          </button>
        </form>
      ),
    });
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={
        isApprovedTable
          ? 'Nėra patvirtintų pakeitimų per paskutinę dieną'
          : 'Visi pakeitimai patvirtinti'
      }
      getRowClassName={(row) =>
        isApprovedTable
          ? getRowStyle(row.valandu)
          : 'bg-white hover:bg-slate-50'
      }
    />
  );
}
