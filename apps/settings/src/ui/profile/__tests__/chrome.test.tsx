import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CompletenessCard } from '../completeness';
import { LogoPreview } from '../logo-preview';
import { SectionNav } from '../section-nav';

afterEach(() => {
  cleanup();
});

describe('CompletenessCard', () => {
  it('renders missing chips and a progressbar', () => {
    render(
      <CompletenessCard
        completeness={{
          completeness_pct: 80,
          missing_fields: [
            { field: 'logo_url', label: 'Pharmacy Logo', action: 'Upload' },
            { field: 'bank_account', label: 'Bank account' },
          ],
        }}
        fallbackPct={0}
        note="Unable to refresh completeness"
      />,
    );
    expect(
      screen.getByRole('progressbar', { name: 'Profile completeness' }),
    ).toHaveAttribute('aria-valuenow', '80');
    expect(screen.getByRole('link', { name: 'Pharmacy Logo' })).toHaveAttribute(
      'href',
      '#section-identity',
    );
    expect(screen.getByText('Unable to refresh completeness')).toBeTruthy();
  });

  it('clamps invalid percents and treats an empty list as complete', () => {
    const { rerender } = render(
      <CompletenessCard
        completeness={{ completeness_pct: Number.NaN, missing_fields: [] }}
        fallbackPct={100}
      />,
    );
    expect(screen.getByText('No missing fields on this profile.')).toBeTruthy();
    expect(
      screen.getByRole('progressbar', { name: 'Profile completeness' }),
    ).toHaveAttribute('aria-valuenow', '0');
    rerender(
      <CompletenessCard
        completeness={{ completeness_pct: 140, missing_fields: [] }}
        fallbackPct={0}
      />,
    );
    expect(
      screen.getByRole('progressbar', { name: 'Profile completeness' }),
    ).toHaveAttribute('aria-valuenow', '100');
    rerender(
      <CompletenessCard
        completeness={{ completeness_pct: -8, missing_fields: [] }}
        fallbackPct={0}
      />,
    );
    expect(
      screen.getByRole('progressbar', { name: 'Profile completeness' }),
    ).toHaveAttribute('aria-valuenow', '0');
  });

  it('uses the fallback percent when completeness is absent', () => {
    render(<CompletenessCard completeness={null} fallbackPct={100} />);
    expect(screen.getByText('Profile is complete')).toBeTruthy();
    expect(
      screen.getByRole('progressbar', { name: 'Profile completeness' }),
    ).toHaveAttribute('aria-valuenow', '100');
  });
});

describe('LogoPreview', () => {
  it('hides when empty or the image fails', () => {
    const { rerender } = render(<LogoPreview url="  " />);
    expect(screen.queryByAltText('Pharmacy logo')).toBeNull();
    rerender(<LogoPreview url="https://cdn.example/logo.png" />);
    const image = screen.getByAltText('Pharmacy logo');
    fireEvent.error(image);
    expect(screen.queryByAltText('Pharmacy logo')).toBeNull();
    rerender(<LogoPreview url="https://cdn.example/logo.png" busy />);
    expect(screen.getByRole('status', { name: 'Uploading logo' })).toBeTruthy();
  });
});

describe('SectionNav', () => {
  it('omits hidden sections', () => {
    render(<SectionNav hiddenIds={['section-bank', 'section-verify']} />);
    expect(screen.getByRole('link', { name: 'Identity' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Bank' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Verify' })).toBeNull();
  });
});
