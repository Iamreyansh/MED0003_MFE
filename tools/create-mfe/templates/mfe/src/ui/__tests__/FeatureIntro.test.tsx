import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FeatureIntro } from '../FeatureIntro';

describe('FeatureIntro', () => {
  it('renders status from the feature service', () => {
    render(<FeatureIntro status="ok" />);
    expect(screen.getByText(/Status: ok/)).toBeTruthy();
  });
});
