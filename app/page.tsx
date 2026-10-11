import Link from "next/link";
import Abstract from "@/content/pages/abstract.mdx";
import { contactLinks, site } from "@/lib/site";
import { staticRoutes } from "@/lib/routes";
import { catalogByKind } from "@/lib/content/site-catalog";
import { numbers } from "@/lib/numbers";
import { perxelWorks } from "@/data/perxel";
import { ossGroups } from "@/data/oss";
import { books, references } from "@/lib/live";
import { Figure0 } from "@/components/plots/Figure0";
import { NumCell } from "@/components/content/Table";

// Counts shown beside a section in the contents, where the section is a list.
const counts: Record<string, number> = {
  "/notes": catalogByKind("note").length,
  "/archived": catalogByKind("archived").length,
  "/perxel": perxelWorks.length,
  "/oss": ossGroups.reduce((n, group) => n + group.repos.length, 0),
  // A source never fetched gets no count.
  ...(books.length ? { "/reading": books.length } : {}),
  ...(references.length ? { "/references": references.length } : {}),
};

// The paper's front matter (plan 001, "Home page"): name, abstract, Table 1, Figure 0 (the calendar), contents,
// contact. No lists of latest items. Ask joins after launch.
export default function Home() {
  return (
    <article>
      <header className="max-w-measure">
        <h1 className="text-4xl md:text-5xl tracking-tight">{site.name}</h1>
        <p className="label mt-3">
          Frontend engineer · Ho Chi Minh City · <span className="num">v{site.version}</span>
        </p>
      </header>

      <section aria-labelledby="abstract" className="mt-10 max-w-measure">
        <h2 id="abstract" className="label font-sans font-semibold uppercase tracking-[0.08em] text-ink">
          Abstract
        </h2>
        <div className="mt-1 [&>p:first-child]:mt-0">
          <Abstract />
        </div>
      </section>

      <section aria-labelledby="table-1" className="mt-14 max-w-measure">
        <p id="table-1" className="label">
          <span className="font-semibold text-ink">Table 1.</span> The numbers, this year and all time, rebuilt on every deploy.
        </p>
        <table className="mt-2 w-full border-collapse border-y border-ink text-[0.9375rem]">
          <thead className="border-b border-rule">
            <tr className="label text-left">
              <th scope="col" className="py-1.5 pr-4 font-normal">Measure</th>
              <th scope="col" className="py-1.5 pr-4 text-right font-normal">
                <span className="num">{new Date().getFullYear()}</span>
              </th>
              <th scope="col" className="py-1.5 text-right font-normal">All time</th>
            </tr>
          </thead>
          <tbody>
            {numbers.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="py-1.5 pr-4 text-left font-normal">
                  {row.href ? <Link href={row.href}>{row.label}</Link> : row.label}
                </th>
                <NumCell value={row.thisYear} />
                <NumCell value={row.allTime} last />
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="Figure 0" className="mt-14 max-w-measure">
        <Figure0 />
      </section>

      <nav aria-labelledby="contents" className="mt-14 max-w-measure">
        <h2 id="contents" className="text-2xl">Contents</h2>
        <ol className="mt-4">
          {staticRoutes.filter((r) => r.path !== "/").map((route) => (
            <li key={route.path} className="flex items-baseline gap-3 py-1">
              <span className="num w-8 shrink-0 text-ink-muted">{route.section ?? route.appendix ?? ""}</span>
              <Link href={route.path}>{route.title}</Link>
              {counts[route.path] !== undefined && (
                <>
                  {/* Dot leaders, as in a printed table of contents. */}
                  <span aria-hidden className="mx-1 flex-1 -translate-y-[0.25em] border-b border-dotted border-ink-muted/60" />
                  <span className="num text-ink-muted">{counts[route.path]}</span>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <section aria-labelledby="contact" className="mt-14 max-w-measure">
        <h2 id="contact" className="text-2xl">Contact</h2>
        <p className="mt-4">I'm open to new opportunities.</p>
        <dl className="mt-4 grid grid-cols-[5.5rem_1fr] gap-y-1">
          {contactLinks.map((link) => (
            <div key={link.label} className="contents">
              <dt className="label pt-0.5">{link.label}</dt>
              <dd>
                <a href={link.href}>{link.name}</a>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
