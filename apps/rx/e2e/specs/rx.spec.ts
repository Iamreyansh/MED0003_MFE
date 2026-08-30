import { expect, test } from '@playwright/test';

test.describe('Rx MFE standalone', () => {
  test('renders queue then detail actions', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Prescriptions standalone harness' }),
    ).toBeVisible();
    await expect(page.getByTestId('rx-queue-page')).toBeVisible();
    await expect(page.getByTestId('rx-queue-table')).toBeVisible();
    await page.getByRole('button', { name: 'detail' }).click();
    await expect(page.getByTestId('rx-detail-page')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reject' })).toBeVisible();
    await page.getByRole('button', { name: 'Reject' }).click();
    await expect(page.getByLabel('Rejection reason')).toBeVisible();
  });

  test('filters the drug register', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'drug-register' }).click();
    await expect(page.getByTestId('rx-drug-register-page')).toBeVisible();
    await expect(page.getByTestId('rx-register-table')).toBeVisible();
    await expect(page.getByLabel('From date')).toBeVisible();
    await expect(page.getByLabel('Schedule')).toBeVisible();
    await expect(page.getByTestId('rx-retention-guidance')).toBeVisible();
  });
});
