import Link from "next/link";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <article className="max-w-measure">
      <p className="label num">Error 404</p>
      <h1 className="mt-2 text-3xl md:text-4xl">No such section</h1>
      <p className="mt-4">
        This page isn&rsquo;t in the paper, or hasn&rsquo;t been written yet. Back to the <Link href="/">front matter</Link>.
      </p>
    </article>
  );
}
