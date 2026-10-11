import { site } from "@/lib/site";

// Placeholder front matter. Part 3 replaces it with the abstract, Table 1, Figure 0 and the Contents.
export default function Home() {
  return (
    <article className="max-w-measure">
      <h1 className="text-4xl md:text-5xl tracking-tight">{site.name}</h1>
      <p className="label mt-3">
        Frontend engineer · Ho Chi Minh City · <span className="num">v{site.version}</span>
      </p>

      <section className="mt-12">
        <h2 className="label font-sans uppercase tracking-[0.12em] text-ink-muted">Abstract</h2>
        <p className="mt-3 text-lg">
          This site is being rebuilt as a research paper: notes as a lab notebook, past work as figures,
          books as a bibliography, and the numbers in Table&nbsp;1. Version 0.1 is the empty notebook.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">§1 Notes</h2>
        <p className="mt-2">
          Coming soon. Code lives on <a href="https://github.com/phucbm">GitHub</a>.
        </p>
      </section>
    </article>
  );
}
