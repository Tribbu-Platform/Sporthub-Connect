import { BeforeAll, AfterAll, Before, After, Status } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { ICustomWorld } from './world';

let browserInstance: Awaited<ReturnType<typeof chromium.launch>>;

BeforeAll(async function () {
  browserInstance = await chromium.launch({ headless: true });
});

AfterAll(async function () {
  await browserInstance.close();
});

Before(async function (this: ICustomWorld) {
  this.browser = browserInstance;
  this.context = await this.browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'es-ES',
  });
  this.page = await this.context.newPage();
});

After(async function (this: ICustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const screenshot = await this.page.screenshot({
      path: `e2e/reports/screenshots/${scenario.pickle.name.replace(/\s+/g, '-')}.png`,
    });
    this.attach(screenshot, 'image/png');
  }
  await this.context.close();
});
