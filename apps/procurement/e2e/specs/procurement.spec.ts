import { expect, test } from '@playwright/test';

test.describe('Procurement MFE standalone', () => {
  test('renders purchases then editor table headers and CSV input', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Procurement standalone harness' }),
    ).toBeVisible();
    await expect(page.getByTestId('procurement-purchases-page')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Purchases' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Import CSV' }).click();
    await expect(page.getByLabel('Invoice CSV')).toBeVisible();
    await page.getByRole('button', { name: 'editor' }).click();
    await expect(page.getByTestId('procurement-editor-page')).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Product' }),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Batch' }),
    ).toBeVisible();
  });

  test('locks Growth screens on Free and shows send dialog on reorder', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Use Free plan' }).click();
    await page.getByRole('button', { name: 'distributors' }).click();
    await expect(page.getByTestId('distributors-plan-lock')).toContainText(
      'Growth',
    );
    await page.getByRole('button', { name: 'reorder' }).click();
    await expect(page.getByTestId('reorder-plan-lock')).toContainText('Growth');
  });

  test('opens labelled send dialog from a Growth reorder', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'reorder' }).click();
    await expect(page.getByTestId('procurement-reorder-page')).toBeVisible();
    await page.getByRole('button', { name: 'Send PO' }).click();
    await expect(page.getByTestId('send-po-dialog')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Send this purchase order?' }),
    ).toBeVisible();
  });
});
