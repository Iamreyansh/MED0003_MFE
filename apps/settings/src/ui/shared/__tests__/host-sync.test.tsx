import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { afterEach, describe, expect, it } from 'vitest';
import { HostSync } from '../host-sync';

afterEach(() => {
  cleanup();
});

describe('HostSync', () => {
  it('applies host errors onto Formik', async () => {
    render(
      <Formik initialValues={{ gstin: '' }} onSubmit={() => undefined}>
        {(formik) => (
          <>
            <HostSync errors={{ gstin: 'Invalid GSTIN' }} formError="Fix tax" />
            <p>{formik.errors.gstin}</p>
            <p>{String(formik.status)}</p>
          </>
        )}
      </Formik>,
    );
    await waitFor(() => {
      expect(screen.getByText('Invalid GSTIN')).toBeTruthy();
      expect(screen.getByText('Fix tax')).toBeTruthy();
    });
  });
});
