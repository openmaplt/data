'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
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
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative">
      <select
        defaultValue={selectedId}
        disabled={isPending}
        onChange={(e) =>
          startTransition(() => {
            router.push(`/adresai?municipality=${e.target.value}`);
          })
        }
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 disabled:cursor-wait"
      >
        {municipalities.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      {isPending && (
        <Loader2 className="w-4 h-4 animate-spin text-blue-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none bg-white" />
      )}
    </div>
  );
}
