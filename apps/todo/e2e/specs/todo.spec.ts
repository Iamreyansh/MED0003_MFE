import { expect, test } from '@playwright/test';
import { STANDALONE_ITEMS } from '../mocks/standalone';

test.describe('Todo MFE standalone', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Sample Todo MFE' }),
    ).toBeVisible();
  });

  test('renders harness chrome and seeded items', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Todo MFE standalone harness' }),
    ).toBeVisible();
    await expect(page.getByText(STANDALONE_ITEMS[0].title)).toBeVisible();
    await expect(page.getByText(STANDALONE_ITEMS[1].title)).toBeVisible();
    await expect(page.getByRole('status').first()).toContainText(
      'todo-standalone',
    );
  });

  test('adds a todo from the form', async ({ page }) => {
    await page.getByLabel('New todo').fill('Order refill');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Order refill')).toBeVisible();
    await expect(page.getByRole('status').last()).toContainText('Items: 3');
  });

  test('toggles completion and filters', async ({ page }) => {
    await page.getByLabel('Complete Pass everything via data').click();
    await page.getByRole('button', { name: 'completed', exact: true }).click();
    await expect(page.getByText('Pass everything via data')).toBeVisible();
    await page.getByRole('button', { name: 'active', exact: true }).click();
    await expect(page.getByText('No todos for this filter.')).toBeVisible();
  });

  test('edits and deletes a todo', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click();
    const editor = page.getByLabel('Edit todo');
    await editor.fill('Wire federation host');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Wire federation host')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).first().click();
    await expect(page.getByText('Wire federation host')).toHaveCount(0);
  });

  test('cancels an in-progress edit from the keyboard path', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Edit' }).nth(1).click();
    await page.getByLabel('Edit todo').fill('Should not persist');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Pass everything via data')).toBeVisible();
    await expect(page.getByText('Should not persist')).toHaveCount(0);
  });

  test('supports keyboard add and 375px layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByLabel('New todo').fill('Mobile task');
    await page.getByLabel('New todo').press('Enter');
    await expect(page.getByText('Mobile task')).toBeVisible();
    await expect(page.getByTestId('todo-mfe')).toBeVisible();
  });
});
