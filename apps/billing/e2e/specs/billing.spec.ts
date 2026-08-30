import { expect, test } from '@playwright/test';

test.describe('Billing MFE standalone', () => {
  test('renders invoices then detail share fields', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Billing standalone harness' }),
    ).toBeVisible();
    await expect(page.getByTestId('billing-invoices-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Invoices' })).toBeVisible();
    await page.getByRole('button', { name: 'invoice-detail' }).click();
    await expect(page.getByTestId('billing-invoice-detail-page')).toBeVisible();
    await expect(page.getByLabel('Share channel')).toBeVisible();
    await expect(page.getByLabel('Phone or email')).toBeVisible();
  });

  test('opens labelled settings and mark-paid dialog', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'invoice-settings' }).click();
    await expect(
      page.getByTestId('billing-invoice-settings-page'),
    ).toBeVisible();
    await expect(page.getByLabel('Invoice prefix')).toBeVisible();
    await page.getByRole('button', { name: 'sales' }).click();
    await expect(page.getByTestId('billing-sales-page')).toBeVisible();
    await expect(page.getByTestId('sales-summary')).toBeVisible();
    await page.getByRole('button', { name: 'Mark paid' }).click();
    await expect(page.getByTestId('mark-paid-dialog')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Record this payment?' }),
    ).toBeVisible();
  });
});
