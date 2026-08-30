import { expect, test } from '@playwright/test';

test.describe('Analytics MFE standalone', () => {
  test('renders overview cards without a fabricated trend', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Analytics standalone harness' }),
    ).toBeVisible();
    await expect(page.getByTestId('analytics-analytics-page')).toBeVisible();
    await expect(page.getByTestId('analytics-overview-cards')).toBeVisible();
    await expect(page.getByText(/sparkline/i)).toHaveCount(0);
  });

  test('opens GST and favorites a report', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('analytics-tab-gst').click();
    await expect(page.getByTestId('analytics-gst-pl')).toBeVisible();
    await page.getByTestId('analytics-tab-reports').click();
    await expect(page.getByTestId('analytics-reports-table')).toBeVisible();
    await page.getByTestId('analytics-favorite-DAYBOOK').click();
    await expect(page.getByText(/favorite/i).first()).toBeVisible();
  });
});
