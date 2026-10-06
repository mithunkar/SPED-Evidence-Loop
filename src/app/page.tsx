import Link from "next/link";

export default function Home() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="Evidence Loop home">
          <span className="brand-mark" aria-hidden="true">
            EL
          </span>
          <span>Evidence Loop</span>
        </Link>
        <Link className="nav-sign-in" href="/sign-in">
          Sign in
        </Link>
      </nav>

      <section className="simple-hero">
        <h1>
          Student progress,
          <br />
          without the clutter.
        </h1>
        <p>
          Create goals, record observations, and keep classroom evidence together.
        </p>
        <Link className="primary-link" href="/sign-up">
          Get started <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
