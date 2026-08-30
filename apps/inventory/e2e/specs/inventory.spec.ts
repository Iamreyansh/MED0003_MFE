import { expect, test } from '@playwright/test';

test.describe('Inventory MFE standalone', () => {
  test('renders list then write-off confirm on detail', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Inventory standalone harness' }),
    ).toBeVisible();
    await expect(page.getByTestId('inventory-list-page')).toBeVisible();
    await expect(page.getByTestId('inventory-summary')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Stock on hand' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'detail' }).click();
    await expect(page.getByTestId('inventory-detail-page')).toBeVisible();
    await page.getByRole('button', { name: 'Write off' }).click();
    await expect(page.getByTestId('writeoff-dialog')).toBeVisible();
    await expect(page.getByLabel('Write-off reason')).toBeVisible();
  });

  test('assigns unlocated stock and keeps Free from enabling online', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'racks' }).click();
    await expect(page.getByTestId('inventory-racks-page')).toBeVisible();
    await page.getByLabel('Product').selectOption('prod-2');
    await page
      .getByTestId('assign-unlocated')
      .getByLabel('Rack')
      .selectOption('A1');
    await page.getByRole('button', { name: 'Assign rack' }).click();
    await expect(page.getByText(/racks:assign/)).toBeVisible();
    await page.getByRole('button', { name: 'Use Free plan' }).click();
    await page.getByRole('button', { name: 'detail' }).click();
    await page.getByLabel('List on online storefront').click();
    await expect(page.getByTestId('online-lock')).toContainText('Growth');
  });
});
