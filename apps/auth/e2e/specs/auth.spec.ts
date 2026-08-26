import { expect, test } from '@playwright/test';

test.describe('Auth MFE standalone', () => {
  test('renders the pharmacy login from the shared harness', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Auth standalone harness' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page.getByLabel('Email or mobile')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('keeps pharmacy submit idle until the form is valid', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(
      page.getByText('Enter your email or +91 mobile number.'),
    ).toBeVisible();
  });

  test('switches portal types from the harness', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'pos' }).click();
    await expect(page.getByTestId('pos-login-page')).toBeVisible();
    await expect(page.getByRole('group', { name: 'PIN keypad' })).toBeVisible();
    await page.getByRole('button', { name: 'sessions' }).click();
    await expect(page.getByTestId('sessions-page')).toBeVisible();
  });

  test('opens the sessions revoke dialog', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'sessions' }).click();
    await expect(page.getByRole('cell', { name: /Chrome/ })).toBeVisible();
    await page.getByRole('button', { name: 'Revoke' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Revoke this session?' }),
    ).toBeVisible();
  });

  test('reaches the primary action by keyboard', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Email or mobile').click();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Show' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused();
  });

  test('does not scroll horizontally at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
