import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

export interface ICustomWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  baseUrl: string;
  email?: string;
  password?: string;
}

export class CustomWorld extends World implements ICustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  baseUrl: string;
  email?: string;
  password?: string;

  constructor(options: IWorldOptions) {
    super(options);
    this.baseUrl = options.parameters.baseUrl || 'http://localhost:3000';
  }
}

setWorldConstructor(CustomWorld);
