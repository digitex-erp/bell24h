# Bell24h NPM Scripts Reference

This document provides a reference for the npm scripts you can use when developing the Bell24h project locally. To run these scripts, you'll need to add them to your `package.json` file after downloading the project.

## Current Scripts

These scripts are already defined in the project:

```json
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

## Recommended Additional Scripts

Add these scripts to your local `package.json` file for easier development and deployment:

```json
"scripts": {
  // Existing scripts...

  // Use the simplified preview script to start the application
  "preview": "node start-preview.js",
  
  // Package the project for deployment
  "package": "node package-for-deployment.js",
  
  // Type checking without emitting files
  "typecheck": "tsc --noEmit",
  
  // Clear build artifacts
  "clean": "rm -rf dist node_modules/.vite",
  
  // For Windows users (use cross-env for environment variables)
  "dev:win": "cross-env NODE_ENV=development tsx server/index.ts",
  "start:win": "cross-env NODE_ENV=production node dist/index.js",
  
  // Run linting if ESLint is set up
  "lint": "eslint . --ext .ts,.tsx",
  
  // If you add tests with Jest or Vitest
  "test": "vitest run",
  "test:watch": "vitest",
  
  // Database utilities
  "db:studio": "drizzle-kit studio",
  "db:generate": "drizzle-kit generate"
}
```

## Script Descriptions

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the development server with hot reloading |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production server after building |
| `npm run check` | Runs TypeScript type checking |
| `npm run db:push` | Pushes schema changes to the database |
| `npm run preview` | Starts the app using the simplified preview script |
| `npm run package` | Creates a ZIP archive of the project for deployment |
| `npm run typecheck` | Runs TypeScript type checking without emitting files |
| `npm run clean` | Removes build artifacts |
| `npm run dev:win` | Windows-compatible dev script (requires cross-env) |
| `npm run start:win` | Windows-compatible production start script |
| `npm run lint` | Runs ESLint to check code quality |
| `npm run test` | Runs tests once |
| `npm run test:watch` | Runs tests in watch mode |
| `npm run db:studio` | Opens Drizzle Studio to manage database |
| `npm run db:generate` | Generates SQL migration files |

## Usage in Deployment Environments

For production deployments, you typically need to:

1. Install production dependencies:
   ```bash
   npm ci --production
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Environment Variables

Remember to set these environment variables in your deployment environment:

```
DATABASE_URL=your_production_db_url
SESSION_SECRET=your_secure_secret
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
PORT=5000 # or as required by your hosting platform
```

## Cross-platform Considerations

For Windows users, you'll need to install the `cross-env` package:

```bash
npm install --save-dev cross-env
```

Then use the Windows-specific scripts (`dev:win`, `start:win`) or update the existing scripts to use cross-env.