/**
 * MFE store factory — Redux Toolkit `configureStore` (thunk middleware included).
 * Re-exported under a MedMate name so remotes share one import path.
 */
export { configureStore as createMfeStore } from '@reduxjs/toolkit';

import type { configureStore } from '@reduxjs/toolkit';

export type MfeStore = ReturnType<typeof configureStore>;
