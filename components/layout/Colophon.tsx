import { site } from "@/lib/site";

export function Colophon() {
  return (
    <footer className="w-full max-w-measure-wide mx-auto px-4 sm:px-6">
      <div className="label flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-rule py-4">
        <span>
          © <span className="num">{new Date().getFullYear()}</span> {site.name}
        </span>
        <span>
          Set in Source Serif 4, Source Sans 3 and IBM Plex Mono · <span className="num">v{site.version}</span>
        </span>
      </div>
    </footer>
  );
}
