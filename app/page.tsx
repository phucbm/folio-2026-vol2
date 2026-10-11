import Link from "next/link";
import About, { meta as aboutMeta } from "@/content/pages/about.mdx";
import { contactLinks, site } from "@/lib/site";
import { staticRoutes } from "@/lib/routes";
import { catalogByKind } from "@/lib/content/site-catalog";
import { perxelWorks } from "@/data/perxel";

// Counts shown beside a section in the contents, where the section is a list.
const counts: Record<string, number> = {
  "/notes": catalogByKind("note").length,
  "/perxel": perxelWorks.length,
};

// Interim front matter: the about text moved over from folio-2026 (plan 001, part 2b). Part 3
// replaces it with the abstract, Table 1 and Figure 0.
export default function Home() {
  const { description } = aboutMeta as { description: string };
  return (
    <article className="max-w-measure">
      <h1 className="text-4xl md:text-5xl tracking-tight">{site.name}</h1>
      <p className="label mt-3">
        Frontend engineer · Ho Chi Minh City · <span className="num">v{site.version}</span>
      </p>

      <p className="mt-10 text-lg">{description}</p>
      <About />

      <section className="mt-14">
        <h2 className="text-2xl">Contents</h2>
        <ol className="mt-4 border-t border-rule">
          {staticRoutes.filter((r) => r.path !== "/").map((route) => (
            <li key={route.path} className="flex items-baseline gap-3 border-b border-rule py-2">
              <span className="num w-8 shrink-0 text-ink-muted">{route.section ?? ""}</span>
              <Link href={route.path}>{route.title}</Link>
              {counts[route.path] !== undefined && (
                <span className="num ml-auto text-ink-muted">{counts[route.path]}</span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">Contact</h2>
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
