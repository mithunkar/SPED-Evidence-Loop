import Link from "next/link";

import { DEMO_SESSION } from "@/demo/fixtures";

import { SessionHistory } from "./session-history";

export default function DemoHistoryPage() {
  return (
    <main className="demo-shell">
      <div className="demo-banner" role="note">
        <span className="demo-banner-dot" aria-hidden="true" />
        Synthetic local demo — fictional entries stay on this device
      </div>

      <header className="demo-header">
        <Link
          className="demo-brand"
          href="/"
          aria-label="Back to project overview"
        >
          <span className="brand-mark" aria-hidden="true">
            EL
          </span>
          <span>Evidence Loop</span>
        </Link>
        <nav className="demo-nav" aria-label="Demo navigation">
          <Link href="/demo/session">New session</Link>
          <span aria-current="page">History</span>
        </nav>
      </header>

      <SessionHistory studentName={DEMO_SESSION.student.displayName} />

      <footer className="demo-footer">
        <p>This fixture is for interface testing only.</p>
        <Link href="/">Return to project overview</Link>
      </footer>
    </main>
  );
}
