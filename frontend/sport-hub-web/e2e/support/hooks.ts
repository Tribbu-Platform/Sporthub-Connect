import { BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { ICustomWorld } from './world';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as http from 'http';

// Timeout global de steps: 30s para operaciones de Playwright (page.fill, page.click, etc.)
setDefaultTimeout(30 * 1000);

let browserInstance: Awaited<ReturnType<typeof chromium.launch>>;
let appProcess: ChildProcess | null = null;

function waitForServer(url: string, timeoutMs: number = 60000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      http.get(url, (res) => {
        // Aceptamos cualquier status code (incluyendo 5xx durante compilacion)
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server at ${url} not ready after ${timeoutMs}ms`));
        } else {
          setTimeout(check, 1000);
        }
      });
    }
    check();
  });
}

BeforeAll(async function () {
  // 1. Iniciar navegador
  browserInstance = await chromium.launch({ headless: true });

  // 2. Iniciar frontend (Next.js dev server)
  // Las respuestas API se mockean via `page.route()` en cada step definition
  // para no depender del backend (BD, Redis, Auth0, etc.)
  appProcess = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });

  appProcess.stdout?.on('data', (data: Buffer) => {
    process.stdout.write(`[frontend] ${data.toString()}`);
  });
  appProcess.stderr?.on('data', (data: Buffer) => {
    process.stderr.write(`[frontend:err] ${data.toString()}`);
  });

  // 3. Esperar a que el servidor responda
  console.log('Esperando a que el frontend inicie en http://localhost:3000 ...');
  await waitForServer('http://localhost:3000');
  console.log('Frontend listo');
});

AfterAll(async function () {
  // 1. Cerrar navegador
  await browserInstance.close();

  // 2. Detener frontend
  if (appProcess) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(appProcess.pid), '/f', '/t']);
    } else {
      appProcess.kill('SIGTERM');
    }
    appProcess = null;
  }
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
