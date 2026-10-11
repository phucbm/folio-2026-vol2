import Link from "next/link";
import { site } from "@/lib/site";

/** The paper's running head: author on the left, version on the right. Section links join it as the
 *  sections are built (part 3 onwards); until then the home page's Contents is the navigation. */
export function RunningHead() {
  return (
    <header className="w-full max-w-measure-wide mx-auto px-4 sm:px-6">
      <div className="label flex items-baseline justify-between gap-4 border-b border-rule py-3">
        <Link href="/" className="text-ink-muted no-underline hover:text-ink">
          {site.name}
        </Link>
        <span className="num">v{site.version}</span>
      </div>
    </header>
  );
}
