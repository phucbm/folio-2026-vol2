// The "pb" of the favicon (`app/icon.svg`), Source Serif 4 at 600 drawn as outlines, so it needs
// no font. Same path as the icon; regenerate both together. The letters take `currentColor`; the
// rounded square is a CSS border, since an SVG stroke this small gets clipped at the edge.
const letters =
  "M3.3 27.62V26.79L5.68 26.36H6.94L9.42 26.79V27.62ZM4.84 27.62Q4.89 26.79 4.9 25.89Q4.92 25 4.93 24.13Q4.94 23.26 4.94 22.47V15.73Q4.94 15.06 4.93 14.57Q4.92 14.08 4.9 13.65Q4.89 13.22 4.87 12.72L3.2 12.46V11.72L7.09 10.32L7.44 10.58L7.54 12.51L7.61 12.7V20.02L7.56 20.18V22.45Q7.56 23.23 7.57 24.12Q7.59 25 7.6 25.89Q7.61 26.79 7.63 27.62ZM10.66 22.23Q9.95 22.23 9.3 21.99Q8.66 21.76 8.09 21.26Q7.51 20.76 6.99 19.9H6.54L6.73 18.71Q7.54 19.73 8.24 20.21Q8.94 20.68 9.8 20.68Q10.61 20.68 11.24 20.22Q11.88 19.75 12.25 18.78Q12.62 17.8 12.62 16.3Q12.62 14.06 11.86 12.96Q11.11 11.86 9.92 11.86Q9.4 11.86 8.86 12.13Q8.32 12.39 7.79 12.84Q7.25 13.29 6.7 13.91L6.51 12.72H7.01Q7.59 11.96 8.21 11.42Q8.83 10.89 9.5 10.6Q10.18 10.32 10.97 10.32Q12.23 10.32 13.26 10.99Q14.28 11.67 14.88 12.97Q15.48 14.27 15.48 16.15Q15.48 18.04 14.82 19.4Q14.16 20.76 13.07 21.49Q11.97 22.23 10.66 22.23ZM16.62 21.9V21.09L18.15 20.83Q18.17 20.21 18.18 19.52Q18.19 18.82 18.2 18.13Q18.22 17.44 18.22 16.89V6.48L16.5 6.22V5.43L20.6 4.38L20.91 4.59L20.81 8.41V12.36L20.89 12.6V20.04V20.09L20.6 22.19ZM23.96 22.23Q23.25 22.23 22.59 21.99Q21.94 21.76 21.35 21.22Q20.77 20.68 20.27 19.78H19.84L20.05 18.71Q20.86 19.73 21.59 20.21Q22.32 20.68 23.17 20.68Q23.94 20.68 24.57 20.21Q25.2 19.73 25.57 18.74Q25.94 17.75 25.94 16.27Q25.94 14.01 25.18 12.94Q24.41 11.86 23.2 11.86Q22.7 11.86 22.16 12.13Q21.63 12.39 21.09 12.84Q20.55 13.29 20 13.91L19.79 12.72H20.39Q20.91 11.91 21.53 11.4Q22.15 10.89 22.85 10.6Q23.56 10.32 24.32 10.32Q25.58 10.32 26.6 10.98Q27.61 11.65 28.2 12.94Q28.8 14.22 28.8 16.13Q28.8 17.99 28.14 19.36Q27.49 20.73 26.4 21.48Q25.32 22.23 23.96 22.23Z";

/** The mark beside the name in the running head and the colophon. Decorative: the name follows it.
 *  Inverts (ink square, paper letters) on hover, its own or a `group` parent's, such as the home link. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex size-[1.75em] shrink-0 rounded-[22%] border border-rule text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper group-hover:border-ink group-hover:bg-ink group-hover:text-paper ${className}`}>
      <svg viewBox="0 0 32 32" aria-hidden="true" className="size-full">
        <path fill="currentColor" d={letters} />
      </svg>
    </span>
  );
}
