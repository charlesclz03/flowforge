import { expect, test, type Page } from '@playwright/test'

const publicPolishRoutes = ['/howitworks', '/pricing', '/download', '/tracks']

async function expectEnterpriseShell(page: Page) {
  await expect(page.locator('#main-content')).toHaveCount(1)

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement
    const main = document.getElementById('main-content')
    return {
      horizontalOverflow: doc.scrollWidth - doc.clientWidth,
      mainHorizontalOverflow: main ? main.scrollWidth - main.clientWidth : 0,
      visibleTextOverflow: Array.from(
        document.querySelectorAll('button, a, [role="button"]')
      ).some((element) => element.scrollWidth > element.clientWidth + 2),
    }
  })

  expect(metrics.horizontalOverflow).toBeLessThanOrEqual(2)
  expect(metrics.mainHorizontalOverflow).toBeLessThanOrEqual(2)
  expect(metrics.visibleTextOverflow).toBe(false)
}

test.describe('enterprise UI polish shell', () => {
  for (const route of publicPolishRoutes) {
    test(`keeps ${route} inside the shell without overflow`, async ({
      page,
    }) => {
      await page.goto(route)
      await expect(page.locator('body')).toBeVisible()
      await expectEnterpriseShell(page)
    })
  }

  test('skill check exposes first-class setup controls', async ({ page }) => {
    await page.goto('/difficultyselection')

    await expect(page.getByText('Practice setup')).toBeVisible()
    await expect(page.getByText('Prompt language')).toBeVisible()
    await expect(page.getByText('Recording mode')).toBeVisible()
    await expect(page.getByRole('radio', { name: /easy/i })).toBeVisible()
    await expect(
      page.getByRole('button', { name: /choose a beat first/i })
    ).toBeDisabled()

    await expectEnterpriseShell(page)
  })
})
