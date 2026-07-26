/**
 * Infinite scrolling strip.
 *
 * The track is rendered twice and translates by exactly -100%, so the second
 * copy lands where the first started and the loop is seamless. Both copies
 * must be identical or the seam shows.
 */
function Track({ items }) {
  return (
    <div className="marquee__track">
      {items.map((item, i) => (
        <span className="marquee__item" key={`${item}-${i}`}>
          {item}
        </span>
      ))}
    </div>
  )
}

export default function Marquee({ items }) {
  return (
    <div className="marquee" aria-hidden="true">
      <Track items={items} />
      <Track items={items} />
    </div>
  )
}
