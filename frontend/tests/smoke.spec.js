import { test, expect } from '@playwright/test';

const unique = () => Math.floor(Date.now() / 1000);

// Helper to wait for toast/message text to appear in the page
async function expectText(page, text) {
  await expect(page.getByText(text, { exact: false })).toBeVisible();
}

test.describe('CivicOS smoke', () => {
  test('enroll member and list', async ({ page }) => {
    const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
    const name = `e2e-${unique()}`;

    await page.goto(base);
    await page.getByText('Membership').click();
    await page.getByText('🪪 Enroll as a Citizen').click();
    await page.getByPlaceholder('Name (unique handle)').fill(name);
    await page.getByPlaceholder('Bio').fill('Automated test user');
    await page.getByRole('combobox').selectOption('Citizen');
    await page.getByText('I agree to the Civic Commons Participation Agreement and Formal Declaration').click();
    await page.getByRole('button', { name: 'Enroll' }).click();
    await expectText(page, '✅');

    await page.getByText('Lookup Member').click();
    await page.getByPlaceholder('Member name').fill(name);
    await page.getByRole('button', { name: 'Search' }).click();
    await expectText(page, name);
  });

  test('create bounty and verify value lookup', async ({ page }) => {
    const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
    await page.goto(base);
    await page.getByText('Bounties').click();
    await page.getByText('Post a Bounty').click();
    await page.getByPlaceholder('Description').fill('Test bounty');
    await page.getByPlaceholder('Base reward (e.g. 100)').fill('10');
    await page.getByPlaceholder('Urgency coefficient (default 0.05)').fill('0.05');
    await page.getByRole('button', { name: 'Post Bounty' }).click();
    await expectText(page, 'Test bounty');
  });

  test('propose bill and list', async ({ page }) => {
    const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
    const title = `Bill ${unique()}`;
    await page.goto(base);
    await page.getByText('Legislature').click();
    await page.getByText('📜 Propose a Bill').click();
    await page.getByPlaceholder('Bill title', { exact: true }).fill(title);
    await page.getByPlaceholder('Category').fill('Test');
    await page.getByPlaceholder('Body').fill('This is an automated test bill.');
    await page.getByRole('button', { name: 'Propose Bill' }).click();
    await expectText(page, 'bill');
    await expectText(page, title);
  });

  test('chat endpoint health', async ({ request }) => {
    const chatEndpoint = process.env.CHAT_ENDPOINT || 'https://civic-os-opensourcism.cloud/chat';
    const resp = await request.post(chatEndpoint, {
      data: { messages: [{ role: 'user', content: 'ping' }] },
      headers: { 'Content-Type': 'application/json' },
      timeout: 10_000
    });
    expect(resp.status()).toBeLessThan(500);
    const text = await resp.text();
    expect(text.length).toBeGreaterThan(0);
  });
});
