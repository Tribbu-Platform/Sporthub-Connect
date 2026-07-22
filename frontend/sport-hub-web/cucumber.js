module.exports = {
  default: {
    paths: ['e2e/features/**/*.feature'],
    require: ['e2e/step_definitions/**/*.ts', 'e2e/support/**/*.ts'],
    requireModule: ['tsx'],
    format: [
      'progress-bar',
      'html:e2e/reports/cucumber-report.html',
      'json:e2e/reports/cucumber-report.json',
    ],
    publishQuiet: true,
    worldParameters: {
      baseUrl: process.env.BDD_BASE_URL || 'http://localhost:3000'
    }
  }
};
