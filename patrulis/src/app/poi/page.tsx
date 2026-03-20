import Link from 'next/link';
import DataTable, { type Column } from '@/components/DataTable';
import { getPOIChanges, getPOICount, type POIChange } from '@/lib/data/poi';

export default async function POIListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 50;

  const changes = await getPOIChanges(page, pageSize);
  const totalCount = await getPOICount();
  const totalPages = Math.ceil(totalCount / pageSize);

  const columns: Column<POIChange>[] = [
    {
      header: 'Tipas',
      key: 'obj_type',
      cellClassName: 'font-mono text-slate-500 uppercase',
      align: 'center',
    },
    {
      header: 'OSM ID',
      key: 'osm_id',
      cellClassName: 'tabular-nums font-medium',
    },
    {
      header: 'Veiksmas',
      cell: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            row.x_type === 'D'
              ? 'bg-rose-100 text-rose-700'
              : row.x_type === 'C'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {row.x_type === 'D'
            ? 'Ištrinta'
            : row.x_type === 'C'
              ? 'Pakeitimas'
              : 'Naujas'}
        </span>
      ),
      align: 'center',
    },
    {
      header: 'Pavadinimas',
      cell: (row) => (
        <Link
          href={`/poi/${row.obj_type}${row.osm_id}?tp=${row.x_type}`}
          className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-all"
        >
          {row.name || (
            <span className="text-slate-400 italic font-normal text-xs">
              Be pavadinimo
            </span>
          )}
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Lankytinų vietų pasikeitimai
          </h1>
          <p className="text-slate-500 mt-1">
            Sąrašas lankytinų vietų, kurių informacija skiriasi nuo OSM duomenų
            bazės.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 text-sm font-medium">
          Neperžiūrėtų: <span className="font-bold">{totalCount}</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={changes}
        getRowKey={(row) => `${row.obj_type}${row.osm_id}`}
        emptyMessage="Šiuo metu lankytinų vietų pasikeitimų nėra!"
        getRowClassName={() => 'bg-white hover:bg-slate-50'}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4 border-t border-slate-100 pt-8">
          <div className="text-sm text-slate-500 font-medium">
            Puslapis <span className="text-slate-900 font-bold">{page}</span> iš{' '}
            <span className="text-slate-900 font-bold">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/poi?page=${page - 1}`}
              className={`px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 transition-all ${
                page <= 1
                  ? 'bg-slate-50 text-slate-300 pointer-events-none'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95'
              }`}
            >
              Ankstesnis
            </Link>
            <Link
              href={`/poi?page=${page + 1}`}
              className={`px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 transition-all ${
                page >= totalPages
                  ? 'bg-slate-50 text-slate-300 pointer-events-none'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95'
              }`}
            >
              Sekantis
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
