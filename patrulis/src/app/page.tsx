import {
  getApprovedChangesets,
  getUnapprovedChangesets,
} from '@/lib/data/changesets';
import ChangesetTable from './_components/ChangesetTable';

export default async function Dashboard() {
  const unapproved = await getUnapprovedChangesets();
  const approved = await getApprovedChangesets();

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Nepatikrinti pakeitimai
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {unapproved.length}
            </span>
          </h2>
        </div>
        <ChangesetTable data={unapproved} isApprovedTable={false} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Paskutiniai patvirtinti pakeitimai
            <span className="text-sm font-normal text-slate-500">
              Per paskutines 24 val. (Iki 15 rodoma)
            </span>
          </h2>
        </div>
        <ChangesetTable data={approved} isApprovedTable={true} />
      </section>
    </div>
  );
}
