module.exports = {
  default: {
    paths: ['e2e/features/f024-us005-badges.feature'],
    require: [
      'e2e/step_definitions/f024-us005-badges.steps.ts',
      'e2e/step_definitions/f024-us001-design-tokens.steps.ts',
      'e2e/support/**/*.ts',
    ],
    requireModule: ['tsx'],
    format: [
      'progress-bar',
      'html:e2e/reports/cucumber-report-f024-us005.html',
      'json:e2e/reports/cucumber-f024-us005.json',
    ],
    publishQuiet: true,
    worldParameters: {
      baseUrl: process.env.BDD_BASE_URL || 'http://localhost:3000',
    },
  },
};
