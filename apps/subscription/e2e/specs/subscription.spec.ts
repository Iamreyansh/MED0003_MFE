import { expect, test } from '@playwright/test';

test.describe('Subscription MFE standalone', () => {
  test('renders the plan catalogue from the shared harness', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Subscription standalone harness' }),
    ).toBeVisible();
    await expect(page.getByTestId('subscription-plans-page')).toBeVisible();
    await expect(page.getByTestId('plan-card-RETAIL_PRO')).toContainText(
      'Growth',
    );
    await expect(page.getByTestId('plan-card-ENTERPRISE')).toContainText(
      'Contact us / custom',
    );
    await expect(page.getByTestId('current-plan-chip')).toContainText('Free');
  });

  test('switches to billing invoices', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'billing' }).click();
    await expect(page.getByTestId('subscription-billing-page')).toBeVisible();
    await expect(page.getByTestId('invoice-inv-unpaid')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pay' })).toBeEnabled();
  });

  test('keeps a horizontal comparison matrix at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    await expect(page.getByTestId('plans-matrix')).toBeVisible();
    await expect(page.getByTestId('plan-card-RETAIL_PRO')).toContainText(
      'Growth',
    );
    await page.getByRole('button', { name: 'billing' }).click();
    await expect(page.getByRole('button', { name: 'Pay' })).toBeEnabled();
  });
});
