import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "eslint-plugin-drizzle-postgres",
  description: "ESLint plugin for Drizzle ORM with PostgreSQL - Enforce best practices and prevent common mistakes",
  base: '/eslint-plugin-drizzle-postgres/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'ESLint Plugin Drizzle PostgreSQL' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/drizzle-logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Rules', link: '/rules/' },
      { text: 'Configs', link: '/configs/' },
      {
        text: 'Resources',
        items: [
          { text: 'Drizzle ORM', link: 'https://orm.drizzle.team' },
          { text: 'Changelog', link: 'https://github.com/gardner/eslint-plugin-drizzle-postgres/releases' }
        ]
      }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is eslint-plugin-drizzle-postgres?', link: '/guide/introduction' },
          { text: 'Getting Started', link: '/guide/getting-started' }
        ]
      },
      {
        text: 'Configuration',
        items: [
          { text: 'Overview', link: '/configs/' },
          { text: 'Recommended', link: '/configs/recommended' },
          { text: 'All', link: '/configs/all' },
          { text: 'Strict', link: '/configs/strict' }
        ]
      },
      {
        text: 'Rules',
        collapsed: false,
        items: [
          {
            text: 'Safety',
            items: [
              { text: 'enforce-delete-with-where', link: '/rules/enforce-delete-with-where' },
              { text: 'enforce-update-with-where', link: '/rules/enforce-update-with-where' }
            ]
          },
          {
            text: 'Schema & Naming',
            items: [
              { text: 'enforce-snake-case-naming', link: '/rules/enforce-snake-case-naming' },
              { text: 'enforce-index-naming', link: '/rules/enforce-index-naming' },
              { text: 'require-timestamp-columns', link: '/rules/require-timestamp-columns' }
            ]
          },
          {
            text: 'Performance',
            items: [
              { text: 'enforce-uuid-indexes', link: '/rules/enforce-uuid-indexes' },
              { text: 'prefer-uuid-primary-key', link: '/rules/prefer-uuid-primary-key' },
              { text: 'no-select-star', link: '/rules/no-select-star' },
              { text: 'limit-join-complexity', link: '/rules/limit-join-complexity' }
            ]
          },
          {
            text: 'Security (RLS)',
            items: [
              { text: 'require-rls-enabled', link: '/rules/require-rls-enabled' },
              { text: 'prevent-rls-bypass', link: '/rules/prevent-rls-bypass' }
            ]
          }
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'Custom Drizzle Instances', link: '/guide/custom-instances' },
          { text: 'TypeScript Integration', link: '/guide/typescript' },
          { text: 'CI/CD Integration', link: '/guide/ci-cd' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/gardner/eslint-plugin-drizzle-postgres' },
      { icon: 'discord', link: 'https://discord.gg/drizzle-orm' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Drizzle Team'
    },

    editLink: {
      pattern: 'https://github.com/gardner/eslint-plugin-drizzle-postgres/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    search: {
      provider: 'local'
    }
  }
})
