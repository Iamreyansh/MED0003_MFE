import { expect, test } from '@playwright/test';

test.describe('POS MFE standalone', () => {
  test('clears a lined cart after confirm', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'POS standalone harness' }),
    ).toBeVisible();
    await page
      .getByRole('combobox', { name: 'Search products' })
      .fill('crocin');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('pos-cart-table')).toBeVisible();
    await page.getByRole('button', { name: 'Clear cart' }).click();
    await expect(page.getByTestId('pos-clear-dialog')).toBeVisible();
    await page
      .getByTestId('pos-clear-dialog')
      .getByRole('button', { name: 'Clear cart' })
      .click();
    await expect(page.getByTestId('pos-cart-empty')).toBeVisible();
  });

  test('attaches a customer and keeps stock failure off the receipt', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('Customer phone').fill('9999999999');
    await page.getByLabel('Customer name').fill('Anita');
    await page.getByRole('button', { name: 'Attach customer' }).click();
    await expect(page.getByTestId('pos-customer')).toContainText('Anita');
    await page
      .getByRole('combobox', { name: 'Search products' })
      .fill('crocin');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page.getByTestId('pos-error')).toContainText('exceeds batch');
    await expect(page.getByTestId('pos-receipt')).toHaveCount(0);
  });

  test('searches and adds on a narrow counter', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page
      .getByRole('combobox', { name: 'Search products' })
      .fill('crocin');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('pos-cart-table')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Checkout' })).toBeVisible();
  });

  test('searches with the keyboard and reaches checkout', async ({ page }) => {
    await page.goto('/');
    const search = page.getByRole('combobox', { name: 'Search products' });
    await search.fill('crocin');
    await search.press('Enter');
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('pos-cart-table')).toBeVisible();
    const checkout = page.getByRole('button', { name: 'Checkout' });
    await expect(checkout).toBeEnabled();
    await checkout.focus();
    await expect(checkout).toBeFocused();
  });
});
