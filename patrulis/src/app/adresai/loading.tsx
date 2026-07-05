import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
      <Loader2 className="w-10 h-10 mb-3 opacity-40 animate-spin" />
      <p className="text-lg font-medium">Kraunama...</p>
    </div>
  );
}
