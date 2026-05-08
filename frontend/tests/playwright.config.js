import { defineConfig } from '@playwright/test';
export default defineConfig({
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  },
});
