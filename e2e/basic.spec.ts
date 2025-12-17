import { test, expect } from '@playwright/test';

test('visitor can see landing page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/FlowForge/);
  await expect(page.getByText('Master your flow')).toBeVisible();
});

test('visitor can navigate to feed', async ({ page }) => {
  await page.goto('/feed');
  await expect(page.getByText('Community Feed')).toBeVisible();
});

// Note: Testing actual recording requires AudioContext mocking or browser flags,
// usually better done with manual verification for this MVP phase.
