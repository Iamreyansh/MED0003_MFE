import { expect, test, type Page } from '@playwright/test';

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
}

test.describe('Settings MFE standalone', () => {
  test('renders profile from the shared harness', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Settings standalone harness' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Pharmacy profile' }),
    ).toBeVisible();
    await expect(page.getByTestId('settings-profile-page')).toBeVisible();
    await expect(page.getByLabel('Business name')).toBeVisible();
    await expect(page.getByLabel('Pharmacy logo')).toBeVisible();
    await expect(page.getByText('You do not need a web link.')).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Missing profile fields' }),
    ).toBeVisible();
    await expect(
      page.getByRole('progressbar', { name: 'Profile completeness' }),
    ).toBeVisible();
    await expect(page.getByLabel('Monday open')).toBeVisible();
    await expect(page.getByText('Weekend')).toBeVisible();
  });

  test('switches to storefront and names the pharmacy in confirm', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'storefront' }).click();
    await expect(page.getByTestId('settings-storefront-page')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Online' })).toBeVisible();
    await page.getByRole('button', { name: 'Set shop offline' }).click();
    await expect(
      page.getByRole('heading', { name: 'Take Sri Rama Medicals offline?' }),
    ).toBeVisible();
  });

  test('reaches business name then tagline by keyboard', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Business name').click();
    await expect(page.getByLabel('Business name')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Tagline')).toBeFocused();
  });

  test('keeps profile usable at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Pharmacy profile' }),
    ).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThan(8);
  });

  test('switches to roles list and opens an immutable matrix', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'roles' }).click();
    await expect(page.getByTestId('settings-roles-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();
    await expect(page.getByTestId('roles-summary')).toBeVisible();
    await expect(page.getByText('Pharmacy Owner')).toBeVisible();
    await expect(page.getByText('Night Shift')).toBeVisible();
    await page
      .getByRole('button', { name: 'View permissions' })
      .first()
      .click();
    await expect(page.getByTestId('roles-matrix')).toBeVisible();
    await expect(page.getByLabel('Read')).toBeDisabled();
  });

  test('keeps roles usable at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.getByRole('button', { name: 'roles' }).click();
    await expect(page.getByTestId('settings-roles-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThan(8);
  });

  test('opens create role from the keyboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'roles' }).click();
    const create = page.getByRole('button', { name: 'Create role' });
    await expect(create).toBeVisible();
    await create.focus();
    await expect(create).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('heading', { name: 'Create role' }),
    ).toBeVisible();
    await expect(page.getByLabel('Display name')).toBeVisible();
  });
});
