import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="nf">
      <h1 className="nf__code">404</h1>
      <p className="section__note" style={{ marginInline: 'auto' }}>
        That shot is not in the cut.
      </p>
      <Link to="/" className="btn">
        <span>Back to work</span>
      </Link>
    </main>
  )
}
