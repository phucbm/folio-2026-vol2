import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import Link from "next/link"
import { Fragment } from "react"
import { PageHeader } from "@/components/content/PageHeader"
import { cv } from "@/data/cv"
import { contactLinks } from "@/lib/site"
import { formatMonth } from "@/lib/utils"
import { A } from "@/components/content/A"

export const metadata: Metadata = pageMetadata("/cv")

// The links a CV needs; Discord and X stay on the home page.
const links = contactLinks.filter((link) => ["Email", "GitHub", "LinkedIn", "npm"].includes(link.label))

// Turns the [text](url) links in a job's body into anchors; everything else stays text.
function withLinks(text: string) {
  return text.split(/(\[[^\]]+\]\([^)]+\))/).map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    return link ? <A key={i} href={link[2]}>{link[1]}</A> : <Fragment key={i}>{part}</Fragment>
  })
}

// The resume on one page, also meant to be printed (the running head and colophon drop out in print).
export default function CvPage() {
  return (
    <article className="max-w-measure">
      <PageHeader label="§D" title="Curriculum vitae" meta={<>{cv.location} · {cv.focus}</>} />

      <p className="text-lg">{cv.headline}</p>
      <p className="mt-2">{cv.summary} {cv.availability}</p>

      <dl className="mt-6 grid grid-cols-[5.5rem_1fr] gap-y-1">
        {links.map((link) => (
          <div key={link.label} className="contents">
            <dt className="label pt-0.5">{link.label}</dt>
            <dd>
              <A href={link.href}>{link.name}</A>
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="experience" className="mt-14">
        <h2 id="experience" className="text-2xl">Experience</h2>
        <ol className="mt-4 border-t border-rule">
          {cv.jobs.map((job) => (
            <li key={job.company} className="border-b border-rule py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p>
                  <span className="font-semibold">{job.role}</span>, <A href={job.href}>{job.company}</A>
                </p>
                <p className="label num">
                  {formatMonth(job.start)} to {job.end ? formatMonth(job.end) : "present"}
                </p>
              </div>
              <p className="mt-1">{withLinks(job.body)}</p>
              {job.note && (
                <p className="label mt-2">
                  <span className="font-semibold text-ink">Note.</span> {job.note}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="education" className="mt-14">
        <h2 id="education" className="text-2xl">Education</h2>
        <div className="mt-4 border-y border-rule py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <p>
              <span className="font-semibold">{cv.education.major}</span>,{" "}
              <A href={cv.education.href}>{cv.education.school}</A>
            </p>
            <p className="label num">
              {cv.education.start} to {cv.education.end}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="stack" className="mt-14">
        <h2 id="stack" className="text-2xl">Stack</h2>
        <p className="mt-4">{cv.stack.join(", ")}</p>
      </section>

      <section aria-labelledby="clients" className="mt-14">
        <h2 id="clients" className="text-2xl">Clients</h2>
        <p className="mt-4">
          {cv.clients.map((client, i) => (
            <Fragment key={i}>
              {i > 0 && ", "}
              {typeof client === "string" ? client : <A href={client.href}>{client.name}</A>}
            </Fragment>
          ))}
        </p>
        <p className="label mt-4">
          Every project is listed in <Link href="/projects">§2 Projects</Link>, every package in{" "}
          <Link href="/oss">§3 Open source</Link>.
        </p>
      </section>

      <section aria-labelledby="certifications" className="mt-14">
        <h2 id="certifications" className="text-2xl">Certifications</h2>
        <ul className="mt-4 border-t border-rule">
          {cv.certifications.map((cert) => (
            <li key={cert.name} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-rule py-2">
              <p>
                {cert.name}, {cert.issuer}
              </p>
              <p className="label num">{formatMonth(cert.date)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="languages" className="mt-14">
        <h2 id="languages" className="text-2xl">Languages</h2>
        <p className="mt-4">
          {cv.languages.map((language, i) => (
            <Fragment key={language.name}>
              {i > 0 && ", "}
              {language.name} ({language.level})
            </Fragment>
          ))}
        </p>
      </section>

      {/* On paper the links are gone, so the address is printed. */}
      <p className="label mt-14 hidden print:block">phucbm.com/cv</p>
    </article>
  )
}
