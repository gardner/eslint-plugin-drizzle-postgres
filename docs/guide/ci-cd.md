# CI/CD Integration

This guide shows how to integrate eslint-plugin-drizzle-postgres into your continuous integration and deployment pipelines.

## GitHub Actions

### Basic Setup

```yaml
# .github/workflows/lint.yml
name: Lint

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint
```

### Strict Enforcement

To ensure no warnings slip through:

```yaml
- name: Run ESLint (strict)
  run: npm run lint -- --max-warnings 0
```

### With pnpm

```yaml
- uses: pnpm/action-setup@v2
  with:
    version: 8

- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Run ESLint
  run: pnpm lint
```

## GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build

lint:
  stage: lint
  image: node:20
  script:
    - npm ci
    - npm run lint -- --max-warnings 0
  rules:
    - if: $CI_MERGE_REQUEST_ID
    - if: $CI_COMMIT_BRANCH == "main"
```

## Pre-commit Hooks

### Using Husky

```bash
npm install --save-dev husky
npx husky init
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
```

### Using lint-staged

For faster commits, only lint changed files:

```bash
npm install --save-dev lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,tsx}": "eslint --fix"
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

## Docker Integration

```dockerfile
# Dockerfile.lint
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run lint -- --max-warnings 0
```

```yaml
# docker-compose.yml
services:
  lint:
    build:
      context: .
      dockerfile: Dockerfile.lint
    volumes:
      - .:/app
      - /app/node_modules
```

## Reporting

### Generate Reports

```json
// package.json
{
  "scripts": {
    "lint:report": "eslint . --format json --output-file eslint-report.json"
  }
}
```

### GitHub Actions Annotations

```yaml
- name: ESLint with Annotations
  uses: ataylorme/eslint-annotate-action@v2
  with:
    check-name: 'ESLint Results'
    fail-on-warning: true
    fail-on-error: true
```

## Performance Tips

### 1. Cache Dependencies

```yaml
# GitHub Actions
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### 2. Parallel Jobs

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        directory: [src, tests, scripts]
    steps:
      - run: npm run lint -- ${{ matrix.directory }}
```

### 3. Incremental Linting

Only lint changed files in PRs:

```bash
#!/bin/bash
# Get changed files
CHANGED_FILES=$(git diff --name-only origin/main...HEAD | grep -E '\.(js|ts|tsx)$')

if [ -n "$CHANGED_FILES" ]; then
  eslint $CHANGED_FILES
fi
```

## Exit Codes

Understanding ESLint exit codes:

- `0` - Success, no errors
- `1` - Linting errors found
- `2` - Configuration or internal error

```yaml
# Handle specific exit codes
- name: Run ESLint
  id: eslint
  run: npm run lint
  continue-on-error: true

- name: Check ESLint results
  if: steps.eslint.outcome == 'failure'
  run: |
    if [ ${{ steps.eslint.outputs.exit-code }} -eq 2 ]; then
      echo "ESLint configuration error"
      exit 1
    fi
```

## Integration with Other Tools

### With TypeScript

```yaml
- name: Type Check
  run: npm run typecheck

- name: Lint
  run: npm run lint
```

### With Prettier

```yaml
- name: Format Check
  run: npm run prettier:check

- name: Lint
  run: npm run lint
```

## Best Practices

1. **Fail Fast** - Run linting early in your pipeline
2. **Cache Aggressively** - Cache node_modules and ESLint cache
3. **Parallelize** - Run linting in parallel with other checks
4. **Report Clearly** - Use formatters that integrate with your CI platform
5. **Progressive Enhancement** - Start with warnings, gradually move to errors

## Example Full Configuration

```yaml
# .github/workflows/quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint with ESLint
        run: npm run lint -- --max-warnings 0

      - name: Upload ESLint report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: eslint-report
          path: eslint-report.json
```

## Next Steps

- Configure [pre-commit hooks](#pre-commit-hooks) for local development
- Set up [custom rules](/guide/custom-instances) for your team
- Review [security best practices](/rules/require-rls-enabled) for production