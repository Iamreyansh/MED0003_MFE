import { expect, test } from '@playwright/test';

test.describe('Finance MFE standalone', () => {
  test('renders settlement list without invented commission', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Finance standalone harness' }),
    ).toBeVisible();
    await expect(page.getByTestId('finance-settlements-page')).toBeVisible();
    await expect(page.getByTestId('settlements-table')).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Net payable' }),
    ).toBeVisible();
    await expect(page.getByText(/gmv −/i)).toHaveCount(0);
  });

  test('opens detail fields and support CTA', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'settlement-detail' }).click();
    await expect(
      page.getByTestId('finance-settlement-detail-page'),
    ).toBeVisible();
    await expect(page.getByTestId('settlement-fields')).toBeVisible();
    await expect(
      page.getByTestId('settlement-field-net_payable'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Raise a support ticket' }).click();
    await expect(page.getByText('navigate:/support/new')).toBeVisible();
  });
});
