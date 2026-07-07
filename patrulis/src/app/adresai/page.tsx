import { MapPin, Plus, Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import DataTable, { type Column } from '@/components/DataTable';
import { getAuthUser, isAuthenticated } from '@/lib/auth';
import {
  type AddressDiffItem,
  getAddressDiff,
  getMunicipalitiesForAdmin,
} from '@/lib/data/addresses';
import DeleteAddressButton from './_components/DeleteAddressButton';
import MunicipalityPicker from './_components/MunicipalityPicker';

interface Props {
  searchParams: Promise<{ municipality?: string }>;
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

  const { municipality } = await searchParams;
  const selectedId = municipality
    ? parseInt(municipality, 10)
    : municipalities[0].id;
  const selected =
    municipalities.find((m) => m.id === selectedId) ?? municipalities[0];

  const diffs = await getAddressDiff(selected.code);

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
          <DeleteAddressButton id={row.id} />
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
            Iš viso: <span className="font-bold">{diffs.length}</span>
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

      <div className="hidden">
        <iframe name="josm" title="JOSM interface" />
      </div>
    </div>
  );
}
