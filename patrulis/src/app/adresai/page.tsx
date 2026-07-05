import { MapPin, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DataTable, { type Column } from '@/components/DataTable';
import { getAuthUser, isAuthenticated } from '@/lib/auth';
import {
  type AddressDiffItem,
  getAddressDiff,
  getAddressDiffCount,
  getMunicipalitiesForAdmin,
} from '@/lib/data/addresses';
import MunicipalityPicker from './_components/MunicipalityPicker';

const PAGE_SIZE = 100;

interface Props {
  searchParams: Promise<{ municipality?: string; page?: string }>;
}

export default async function AddressesPage({ searchParams }: Props) {
  const isAuth = await isAuthenticated();
  if (!isAuth) redirect('/login');

  const username = (await getAuthUser()) as string;
  const municipalities = await getMunicipalitiesForAdmin(username);

  if (municipalities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <MapPin className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-lg font-medium">Nėra priskirtų savivaldybių</p>
      </div>
    );
  }

  const { municipality, page: pageParam } = await searchParams;
  const selectedId = municipality
    ? parseInt(municipality, 10)
    : municipalities[0].id;
  const selected =
    municipalities.find((m) => m.id === selectedId) ?? municipalities[0];

  const page = Number(pageParam) || 1;

  const [diffs, totalCount] = await Promise.all([
    getAddressDiff(selected.id, page, PAGE_SIZE),
    getAddressDiffCount(selected.id),
  ]);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const columns: Column<AddressDiffItem>[] = [
    {
      header: 'Tipas',
      cell: (row) =>
        row.type.trim() === 'N' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            <Plus className="w-3 h-3" /> Pridėti
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            <Trash2 className="w-3 h-3" /> Ištrinti
          </span>
        ),
    },
    {
      header: 'Adresas',
      cell: (row) => (
        <div className="text-slate-700">
          <span className="font-medium">{row.city}</span>
          {row.street && <span className="text-slate-500">, {row.street}</span>}
          <span className="font-semibold"> {row.housenumber}</span>
          {row.unit && <span className="text-slate-500">-{row.unit}</span>}
        </div>
      ),
    },
    {
      header: 'Koordinatės',
      cell: (row) =>
        row.x != null && row.y != null ? (
          <span className="text-slate-400 tabular-nums text-xs">
            {row.y.toFixed(6)}, {row.x.toFixed(6)}
          </span>
        ) : (
          <span className="text-slate-300 text-xs">—</span>
        ),
    },
    {
      header: 'Pastaba',
      cell: (row) => (
        <span className="text-slate-500 text-sm">{row.note ?? '—'}</span>
      ),
    },
    {
      header: 'JOSM',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <a
            href={row.action_open}
            target="josm"
            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 hover:bg-slate-200 transition-all font-bold uppercase tracking-wider"
          >
            Atidaryti
          </a>
          <a
            href={row.action}
            target="josm"
            className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-200 transition-all font-bold uppercase tracking-wider"
          >
            Veiksmas
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Adresai</h1>
          <p className="text-slate-500 mt-1">
            Adresų skirtumai, kuriuos reikia sutvarkyti OpenStreetMap.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MunicipalityPicker
            municipalities={municipalities}
            selectedId={selected.id}
          />
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 text-sm font-medium whitespace-nowrap">
            Iš viso: <span className="font-bold">{totalCount}</span>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={diffs}
        getRowKey={(row) => row.id}
        emptyMessage="Šiai savivaldybei skirtumų nėra!"
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
              href={`/adresai?municipality=${selected.id}&page=${page - 1}`}
              className={`px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 transition-all ${
                page <= 1
                  ? 'bg-slate-50 text-slate-300 pointer-events-none'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95'
              }`}
            >
              Ankstesnis
            </Link>
            <Link
              href={`/adresai?municipality=${selected.id}&page=${page + 1}`}
              className={`px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 transition-all ${
                page >= totalPages
                  ? 'bg-slate-50 text-slate-300 pointer-events-none'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95'
              }`}
            >
              Kitas
            </Link>
          </div>
        </div>
      )}

      <div className="hidden">
        <iframe name="josm" title="JOSM interface" />
      </div>
    </div>
  );
}
