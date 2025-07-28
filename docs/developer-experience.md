# Bell24H.com Developer Experience & Automation

## CLI Tool: `bell24h-cli`
- Run `node scripts/bell24h-cli.js <command>`
- Commands:
  - `setup`: Install all dependencies
  - `lint`: Run linter
  - `test`: Run all tests
  - `changelog`: Print recent commit log

## Onboarding Checklist
- Clone the repo
- Run `node scripts/bell24h-cli.js setup`
- Copy `.env.production.template` to `.env.production` and fill in secrets
- Run `node scripts/bell24h-cli.js lint` and `node scripts/bell24h-cli.js test`
- Start the dev server: `npm run dev`

## How to Expand
- Add more CLI commands for automation (e.g., deploy, db-migrate)
- Integrate with CI/CD pipelines
- Improve changelog with release notes

---
For questions or improvements, contact dev@bell24h.com.
