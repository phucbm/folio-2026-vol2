import Link from "next/link";
import { site } from "@/lib/site";
import { staticRoutes } from "@/lib/routes";

// The numbered sections, in contents order.
const sections = staticRoutes.filter((route) => route.section);

/** The paper's running head: author on the left, the numbered sections, the version on the right.
 *  The sections are labels in mono (`§1`), each with its title for screen readers and on hover. */
export function RunningHead() {
  return (
    <header className="print:hidden w-full max-w-measure-wide mx-auto px-4 sm:px-6">
      <div className="label flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule py-3">
        <Link href="/" className="text-ink-muted no-underline hover:text-ink">
          {site.name}
        </Link>
        <nav aria-label="Sections" className="order-last w-full sm:order-none sm:w-auto">
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {sections.map((route) => (
              <li key={route.path}>
                <Link href={route.path} title={route.title} className="text-ink-muted no-underline hover:text-ink">
                  <span className="num">{route.section}</span> {route.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <span className="num">v{site.version}</span>
      </div>
    </header>
  );
}
