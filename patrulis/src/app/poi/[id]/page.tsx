import {
  ArrowLeft,
  Check,
  ExternalLink,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { acceptPOIChange, transferPOI } from '@/lib/actions/poi';
import { isAuthenticated } from '@/lib/auth';
import { getPOIDetail, getPOIPotentialTransfers } from '@/lib/data/poi';

import POIChangeMap from '../_components/POIChangeMap';

interface POIDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tp: string }>;
}

export default async function POIDetailPage({
  params,
  searchParams,
}: POIDetailPageProps) {
  const { id } = await params;
  const { tp } = await searchParams;
  const isAuth = await isAuthenticated();

  const { details, info } = await getPOIDetail(id, tp);
  const transfers =
    tp === 'D'
      ? await getPOIPotentialTransfers(info.osm_id, info.obj_type)
      : [];

  // OSM link generation
  let osmId = info.osm_id;
  let osmType = 'node';
  if (osmId < 0) {
    osmType = 'relation';
    osmId = -osmId;
  } else if (info.obj_type === 'n') {
    osmType = 'node';
  } else if (info.obj_type === 'p') {
    osmType = 'way';
  }
  const osmUrl = `https://www.openstreetmap.org/${osmType}/${osmId}/history`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/poi"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Atgal į sąrašą
        </Link>
        {isAuth && (
          <form
            action={acceptPOIChange.bind(null, info.osm_id, info.obj_type, tp)}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" /> Patvirtinti pakeitimą
            </button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Lankytinos vietos pasikeitimas
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                {osmType} {osmId} •{' '}
                {tp === 'D' ? 'Ištrinta' : tp === 'C' ? 'Pakeitimas' : 'Naujas'}
              </p>
            </div>
          </div>
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
          >
            <ExternalLink className="w-3 h-3" /> OSM Istorija
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  Žyma (Tag)
                </th>
                <th className="px-6 py-3 text-left font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  Senas (DB)
                </th>
                <th className="px-6 py-3 text-left font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  Naujas (OSM)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {details.map((detail) => (
                <tr
                  key={detail.tag}
                  className={`${detail.changed ? 'bg-amber-50/40' : 'bg-white'} hover:bg-slate-50/30 transition-colors`}
                >
                  <td className="px-6 py-3 font-mono text-slate-500 font-medium">
                    {detail.tag}
                  </td>
                  <td className="px-6 py-3 text-slate-600 break-all leading-relaxed">
                    {detail.old_val || (
                      <span className="text-slate-300 italic opacity-50">
                        —
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-6 py-3 italic break-all leading-relaxed ${detail.changed ? 'font-bold text-slate-900 bg-amber-50/20' : 'text-slate-600 opacity-60'}`}
                  >
                    {detail.new_val || (
                      <span className="text-slate-300 italic opacity-50">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <POIChangeMap lat={info.lat} lon={info.lon} />

      {tp === 'D' && transfers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Potencialūs perėmėjai
          </h2>
          <div className="grid gap-4">
            {transfers.map((t) => (
              <div
                key={`${t.obj_type}${t.osm_id}`}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest w-20">
                    {t.obj_type} {t.osm_id}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">
                      {t.name || 'be pavadinimo'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Atstumas:{' '}
                      <span className="font-mono">{t.atstumas}m.</span>
                    </div>
                  </div>
                </div>
                {isAuth && (
                  <form
                    action={transferPOI.bind(
                      null,
                      t.old_id,
                      t.old_type,
                      t.osm_id,
                      t.obj_type,
                      t.x_type,
                      t.uid,
                    )}
                  >
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                      Perkelti ID
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
