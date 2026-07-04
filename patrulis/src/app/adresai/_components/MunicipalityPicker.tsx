'use client';

import { useRouter } from 'next/navigation';
import type { Municipality } from '@/lib/data/addresses';

interface Props {
  municipalities: Municipality[];
  selectedId: number;
}

export default function MunicipalityPicker({
  municipalities,
  selectedId,
}: Props) {
  const router = useRouter();

  return (
    <select
      defaultValue={selectedId}
      onChange={(e) => router.push(`/adresai?municipality=${e.target.value}`)}
      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {municipalities.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
