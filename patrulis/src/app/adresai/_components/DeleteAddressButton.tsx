'use client';

import { Check, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { deleteAddressDiff } from '@/lib/actions/addresses';

interface Props {
  id: number;
}

export default function DeleteAddressButton({ id }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => deleteAddressDiff(id))}
      className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-200 disabled:opacity-60 disabled:cursor-wait transition-all font-bold uppercase tracking-wider cursor-pointer"
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Check className="w-3 h-3" />
      )}
      Pataisyta
    </button>
  );
}
