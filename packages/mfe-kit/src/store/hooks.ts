import type { Action, ThunkDispatch } from '@reduxjs/toolkit';
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';

/**
 * Factory for typed Redux hooks bound to a specific MFE store shape.
 */
export function createMfeStoreHooks<
  RootState,
  AppDispatch extends ThunkDispatch<RootState, unknown, Action> = ThunkDispatch<
    RootState,
    unknown,
    Action
  >,
>() {
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
  return { useAppDispatch, useAppSelector };
}
