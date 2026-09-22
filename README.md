# SPED Evidence Loop

SPED Evidence Loop is a private classroom data-collection application for
recording student goal observations, tracking teaching strategies, and preparing
teacher-reviewed progress summaries.

The project is currently in its local-foundation milestone and uses synthetic
data only. See [`docs/SPED_EVIDENCE_LOOP_PRODUCT_REQUIREMENTS.md`](docs/SPED_EVIDENCE_LOOP_PRODUCT_REQUIREMENTS.md)
for the product requirements and implementation plan.

## Local development

This project requires Node.js 22 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Quality checks

```bash
npm run lint
npm test
npm run typecheck
npm run build
```
