import { expect, test } from '@playwright/test';

test.describe('__TITLE__ MFE standalone', () => {
  test('renders the domain layout from the shared harness', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: '__TITLE__ standalone harness' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '__TITLE__ MFE' }),
    ).toBeVisible();
    await expect(page.getByTestId('__NAME__-mfe')).toBeVisible();
  });
});
