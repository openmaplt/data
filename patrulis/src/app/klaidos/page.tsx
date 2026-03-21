import { Check, Clock } from 'lucide-react';
import DataTable, { type Column } from '@/components/DataTable';
import { fixError } from '@/lib/actions/errors';
import { isAuthenticated } from '@/lib/auth';
import { type ErrorItem, getErrorCount, getErrors } from '@/lib/data/errors';

export default async function KlaidosPage() {
  const errors = await getErrors();
  const totalCount = await getErrorCount();
  const isAuth = await isAuthenticated();

  const columns: Column<ErrorItem>[] = [
    {
      header: 'Klaida',
      key: 'error_name',
      cellClassName: 'font-semibold text-slate-900',
    },
    {
      header: 'Objektas',
      cell: (row) => (
        <div className="flex items-center justify-between gap-4 min-w-[140px]">
          <span className="text-slate-600 tabular-nums font-medium">
            {row.object_id}
          </span>
          <a
            href={`http://localhost:8111/load_object?objects=${row.object_type}${row.object_id}`}
            target="josm"
            className="text-[10px] bg-blue-100/50 text-blue-700 px-2 py-1 rounded border border-blue-200/50 hover:bg-blue-100 transition-all font-bold uppercase tracking-wider leading-none"
          >
            JOSM
          </a>
        </div>
      ),
    },
    {
      header: 'Aprašymas',
      cell: (row) => (
        <div className="max-w-md text-slate-600">{row.description}</div>
      ),
    },
    {
      header: 'Aptikta',
      cell: (row) => (
        <div className="text-slate-500 whitespace-nowrap flex items-center gap-1.5">
          <Clock className="w-3 h-3 opacity-60" /> {row.first_occurrence}
        </div>
      ),
    },
    {
      header: 'Objektas keistas',
      cell: (row) => (
        <div className="text-slate-500 whitespace-nowrap">
          {row.object_timestamp}
        </div>
      ),
    },
  ];

  if (isAuth) {
    columns.push({
      header: 'Veiksmai',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <form action={fixError.bind(null, row.error_id, row.source)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors cursor-pointer"
            >
              <Check className="w-3 h-3" /> Pataisyta
            </button>
          </form>
        </div>
      ),
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Paskutinės klaidos
          </h1>
          <p className="text-slate-500 mt-1">
            Sąrašas aptiktų žemėlapio klaidų, kurias reikia peržiūrėti.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 text-sm font-medium">
          Iš viso klaidų: <span className="font-bold">{totalCount}</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={errors}
        getRowKey={(row) => row.error_id}
        emptyMessage="Šiuo metu klaidų nėra!"
        getRowClassName={() => 'bg-white hover:bg-slate-50'}
      />

      <div className="hidden">
        {/* Hidden iframe for JOSM commands to work without reloading */}
        <iframe name="josm" title="JOSM interface" />
      </div>
    </div>
  );
}
