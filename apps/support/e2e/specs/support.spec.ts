import { expect, test } from '@playwright/test';

test.describe('Support MFE standalone', () => {
  test('creates a ticket then opens detail without a list', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Support standalone harness' }),
    ).toBeVisible();
    await expect(page.getByTestId('support-ticket-new-page')).toBeVisible();
    await page.getByLabel('Subject').fill('POS printer offline');
    await page.getByRole('button', { name: 'Create ticket' }).click();
    await expect(page.getByText(/navigate:\/support\/tickets\//)).toBeVisible();
    await expect(page.getByText(/\/support\/tickets$/)).toHaveCount(0);
  });

  test('hides escalate and continues a resolved ticket', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'ticket-detail' }).click();
    await expect(page.getByTestId('support-ticket-detail-page')).toBeVisible();
    await expect(page.getByTestId('ticket-description')).toBeVisible();
    await expect(page.getByRole('button', { name: /escalate/i })).toHaveCount(
      0,
    );
    await page.getByLabel('Reply').fill('Still failing after hours');
    await page.getByRole('button', { name: 'Send reply' }).click();
    await expect(page.getByTestId('ticket-replies')).toContainText(
      'Still failing after hours',
    );
  });

  test('browses help then opens an article', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'help', exact: true }).click();
    await expect(page.getByTestId('support-help-page')).toBeVisible();
    await expect(page.getByTestId('help-catalogue')).toBeVisible();
    await page.getByRole('button', { name: 'Store opening hours' }).click();
    await expect(page.getByText('navigate:/help/articles/hours')).toBeVisible();
    await page.getByRole('button', { name: 'help-article' }).click();
    await expect(page.getByTestId('help-article-body')).toBeVisible();
    await page.getByTestId('help-article-helpful').click();
    await expect(page.getByTestId('help-deflection-sent')).toBeVisible();
  });
});
