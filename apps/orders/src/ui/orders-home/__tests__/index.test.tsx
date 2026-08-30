import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import OrdersMfe from '../../../app/OrdersMfe';

afterEach(() => {
  cleanup();
});

describe('OrdersHomeScreen', () => {
  it('shows guidance and never loads orders', () => {
    const onSubmit = vi.fn(async () => ({ ok: true as const }));
    render(<OrdersMfe data={data(feature('orders-home', onSubmit))} />);
    expect(screen.getByTestId('orders-home-guidance')).toHaveTextContent(
      /notification/i,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
