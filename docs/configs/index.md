# Configuration Presets

eslint-plugin-drizzle-postgres provides three preset configurations to help you get started quickly. Each preset is designed for different use cases and strictness levels.

## Available Presets

| Preset | Description | Best For |
|--------|-------------|----------|
| [recommended](/configs/recommended) | Essential safety rules | Getting started, existing projects |
| [all](/configs/all) | Comprehensive rule set | New projects, balanced approach |
| [strict](/configs/strict) | All rules as errors | Greenfield projects, enforcing best practices |

## Quick Comparison

| Rule | Recommended | All | Strict |
|------|:-----------:|:---:|:------:|
| enforce-delete-with-where | ❌ error | ❌ error | ❌ error |
| enforce-update-with-where | ❌ error | ❌ error | ❌ error |
| enforce-snake-case-naming | ⚠️ warn | ❌ error | ❌ error |
| no-select-star | ⚠️ warn | ⚠️ warn | ❌ error |
| enforce-uuid-indexes | - | ❌ error | ❌ error |
| enforce-index-naming | - | ❌ error | ❌ error |
| require-timestamp-columns | - | ⚠️ warn | ❌ error |
| prefer-uuid-primary-key | - | ⚠️ warn | ❌ error |
| limit-join-complexity | - | ⚠️ warn | ❌ error |
| require-rls-enabled | - | ⚠️ warn | ❌ error |
| prevent-rls-bypass | - | ⚠️ warn | ❌ error |

## Using Presets

### Flat Config (ESLint 9+)

```js
// eslint.config.js
import drizzle from 'eslint-plugin-drizzle-postgres';

export default [
  // Choose one:
  ...drizzle.configs.recommended,
  // or
  ...drizzle.configs.all,
  // or
  ...drizzle.configs.strict
];
```

### Legacy Config

```json
// .eslintrc.json
{
  "extends": [
    // Choose one:
    "plugin:drizzle/recommended"
    // or
    "plugin:drizzle/all"
    // or
    "plugin:drizzle/strict"
  ]
}
```

## Customizing Presets

You can start with a preset and override specific rules:

```js
// eslint.config.js
import drizzle from 'eslint-plugin-drizzle-postgres';

export default [
  // Start with recommended
  ...drizzle.configs.recommended,

  // Then customize
  {
    rules: {
      // Upgrade a warning to error
      'drizzle/enforce-snake-case-naming': 'error',

      // Add rules not in recommended
      'drizzle/enforce-uuid-indexes': 'error',
      'drizzle/require-rls-enabled': ['error', {
        sensitivePatterns: ['user', 'account', 'payment']
      }],

      // Disable a rule
      'drizzle/no-select-star': 'off'
    }
  }
];
```

## Choosing the Right Preset

### Use `recommended` when:
- Adding to an existing project
- Getting started with the plugin
- You want only the most critical safety rules
- Your team is new to Drizzle ORM

### Use `all` when:
- Starting a new project
- You want comprehensive coverage
- You prefer warnings for style rules
- You want to gradually adopt best practices

### Use `strict` when:
- Building a greenfield project
- Your team values consistency
- You want to enforce all best practices
- You're building security-critical applications

## Migration Path

A common approach is to start with `recommended` and gradually move toward `strict`:

```js
// Phase 1: Start with recommended
export default [...drizzle.configs.recommended];

// Phase 2: Add specific rules you care about
export default [
  ...drizzle.configs.recommended,
  {
    rules: {
      'drizzle/enforce-uuid-indexes': 'warn',
      'drizzle/require-timestamp-columns': 'warn'
    }
  }
];

// Phase 3: Move to all
export default [...drizzle.configs.all];

// Phase 4: Eventually adopt strict
export default [...drizzle.configs.strict];
```

## Next Steps

- Explore individual preset configurations:
  - [Recommended Config](/configs/recommended)
  - [All Config](/configs/all)
  - [Strict Config](/configs/strict)
- Learn about [individual rules](/rules/)
- See [advanced configuration examples](/guide/custom-instances)