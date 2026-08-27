import { expect, test, type Page } from '@playwright/test';

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
}

test.describe('Onboarding MFE standalone', () => {
  test('renders register from the shared harness', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Onboarding standalone harness' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Create your pharmacy' }),
    ).toBeVisible();
    await expect(page.getByTestId('register-page')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Onboarding steps' }),
    ).toBeVisible();
    await expect(page.getByText('Path to go-live')).toBeVisible();
    await expect(page.getByText('Free to start')).toBeVisible();
    await expect(page.getByText('Step 1 of 4')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Owner' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Create Free account' }),
    ).toBeVisible();
  });

  test('keeps register submit idle until the form is valid', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Free account' }).click();
    await expect(page.getByText('Enter the owner name.')).toBeVisible();
  });

  test('switches screens from the harness', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'verify' }).click();
    await expect(page.getByTestId('register-verify-page')).toBeVisible();
    await expect(page.getByRole('group', { name: 'Email OTP' })).toBeVisible();
    await expect(page.getByText('priya@srirama.in')).toBeVisible();
    await page.getByRole('button', { name: 'status' }).click();
    await expect(page.getByTestId('onboarding-status-page')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Upload KYC documents' }),
    ).toBeVisible();
    await expect(page.getByText('Email verified (done)')).toBeVisible();
    await expect(page.getByText('KYC documents (current)')).toBeVisible();
    await page.getByRole('button', { name: 'kyc', exact: true }).click();
    await expect(page.getByTestId('onboarding-kyc-page')).toBeVisible();
    await expect(page.getByLabel('Document file')).toBeVisible();
    await expect(page.getByText('Still needed')).toBeVisible();
  });

  test('reaches owner name then email by keyboard', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Owner name').click();
    await expect(page.getByLabel('Owner name')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();
  });

  test('hides the brand pane and keeps the step rail at 375px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Create your pharmacy' }),
    ).toBeVisible();
    await expect(page.getByText('Path to go-live')).not.toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Onboarding steps' }),
    ).toBeVisible();
    await expect(
      page.locator(
        'nav[aria-label="Onboarding steps"]:visible [aria-current="step"]',
      ),
    ).toContainText('Account');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    await page.getByRole('button', { name: 'verify' }).click();
    await expect(page.getByRole('group', { name: 'Email OTP' })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    await page.getByRole('button', { name: 'status' }).click();
    await expect(
      page.getByRole('button', { name: 'Upload KYC documents' }),
    ).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    await page.getByRole('button', { name: 'kyc', exact: true }).click();
    await expect(page.getByLabel('Document file')).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });

  test('keeps the split layout at 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await expect(page.getByText('Path to go-live')).toBeVisible();
    await expect(page.getByText('Licences in one place')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Shop' })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });

  test('does not scroll horizontally at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });
});
