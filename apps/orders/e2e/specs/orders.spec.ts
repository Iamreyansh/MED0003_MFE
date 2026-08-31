import { expect, test } from '@playwright/test';

test.describe('Orders MFE standalone', () => {
  test('renders quotes and keeps expired read-only', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Orders standalone harness' }),
    ).toBeVisible();
    await expect(page.getByTestId('orders-rx-quotes-page')).toBeVisible();
    await expect(page.getByTestId('orders-quotes-table')).toBeVisible();
    await expect(
      page.getByTestId('orders-quote-readonly-q-expired'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Quote', exact: true }).click();
    await expect(page.getByLabel('Quoted price')).toBeVisible();
  });

  test('shows the inbound list and order actions', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'orders-home' }).click();
    await expect(page.getByTestId('orders-home-empty')).toBeVisible();
    await page.getByRole('button', { name: 'order-actions' }).click();
    await expect(page.getByTestId('orders-order-actions-page')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Accept', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Reject' }).click();
    await expect(page.getByLabel('Rejection reason')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'CONFIRMED' }).click();
    await expect(page.getByTestId('orders-actions-error')).toBeVisible();
    await expect(page.getByLabel('Rider id')).toBeVisible();
  });
});
