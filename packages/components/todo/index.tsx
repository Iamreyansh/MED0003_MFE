/**
 * Federated remote entry — hosts import `remote/Mfe`.
 * CSS side-effects live ONLY here so the host receives styles once.
 */
import '@medmate/ui/styles.css';
import './src/styles/todo.css';

export { default } from './src/components/TodoMfe';
