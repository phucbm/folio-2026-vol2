import Link from "next/link";
import { site } from "@/lib/site";
import { staticRoutes } from "@/lib/routes";

// The back matter, in contents order: the running head has the sections, the foot the appendices.
const appendices = staticRoutes.filter((route) => route.appendix);

export function Colophon() {
  return (
    <footer className="print:hidden w-full max-w-measure-wide mx-auto px-4 sm:px-6">
      <div className="label flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-rule py-4">
        <span>
          © <span className="num">{new Date().getFullYear()}</span> {site.name}
        </span>
        <nav aria-label="Appendices">
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {appendices.map((route) => (
              <li key={route.path}>
                <Link href={route.path} className="text-ink-muted no-underline hover:text-ink">
                  <span className="num">{route.appendix}</span> {route.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
