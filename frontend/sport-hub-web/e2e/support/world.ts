import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

export interface ICustomWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  baseUrl: string;
  email?: string;
  password?: string;
  /** Stores the last computed style result from an element injection */
  lastStyle?: Record<string, string>;
  /** Selector stored by When steps for use in Then steps */
  currentSelector?: string;
}

export class CustomWorld extends World implements ICustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  baseUrl: string;
  email?: string;
  password?: string;
  currentSelector?: string;

  constructor(options: IWorldOptions) {
    super(options);
    this.baseUrl = options.parameters.baseUrl || 'http://localhost:3000';
  }
}

setWorldConstructor(CustomWorld);
