import { expect, test } from '@playwright/test';

test.describe('Catalogue MFE standalone', () => {
  test('renders search results after a debounced query', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Catalogue standalone harness' }),
    ).toBeVisible();
    await expect(page.getByTestId('catalogue-search-page')).toBeVisible();
    await page.getByLabel('Search medicines').fill('crocin');
    await expect(page.getByTestId('search-results')).toBeVisible();
    await expect(page.getByTestId('search-result-med-para')).toContainText(
      'Crocin',
    );
    await expect(page.getByTestId('schedule-med-para')).toContainText(
      'Schedule H',
    );
  });

  test('opens mapping delete confirm', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'mapping' }).click();
    await expect(page.getByTestId('catalogue-mapping-page')).toBeVisible();
    await expect(page.getByTestId('mapping-row-map-aug')).toBeVisible();
    await page.getByRole('button', { name: 'Delete mapping' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByTestId('mapping-delete-dialog')).toContainText(
      'Physical inventory is not affected',
    );
  });
});
