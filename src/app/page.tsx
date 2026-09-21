const steps = [
  { number: "01", label: "Define", detail: "Student-specific goals" },
  { number: "02", label: "Observe", detail: "Fast session scoring" },
  { number: "03", label: "Review", detail: "Clear progress patterns" },
];

export default function Home() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="SPED Evidence Loop home">
          <span className="brand-mark" aria-hidden="true">
            EL
          </span>
          <span>SPED Evidence Loop</span>
        </a>
        <span className="prototype-badge">Foundation build</span>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Classroom evidence, thoughtfully connected</p>
          <h1>Less paperwork.<br />More useful evidence.</h1>
          <p className="hero-description">
            A private classroom tool for recording goal-level observations,
            understanding progress, and preparing accurate family conversations.
          </p>
          <div className="status-row" aria-label="Current project status">
            <span className="status-dot" aria-hidden="true" />
            Local application foundation is ready
          </div>
        </div>

        <aside className="principle-card" aria-labelledby="principle-title">
          <p className="card-label">Guiding principle</p>
          <h2 id="principle-title">Every summary should lead back to the evidence.</h2>
          <div className="evidence-preview" aria-hidden="true">
            <span className="score score-primary">4</span>
            <span className="score">3</span>
            <span className="score">2</span>
            <span className="score">1</span>
            <span className="score">0</span>
            <span className="score score-nd">ND</span>
          </div>
          <p className="card-note">
            Ordered support levels stay distinct from missing data, with scorer,
            strategy, and context preserved.
          </p>
        </aside>
      </section>

      <section className="workflow" aria-labelledby="workflow-title">
        <div className="section-heading">
          <p className="eyebrow">The evidence loop</p>
          <h2 id="workflow-title">Built around the classroom workflow</h2>
        </div>
        <ol className="step-grid">
          {steps.map((step) => (
            <li key={step.number} className="step-card">
              <span className="step-number">{step.number}</span>
              <div>
                <h3>{step.label}</h3>
                <p>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
