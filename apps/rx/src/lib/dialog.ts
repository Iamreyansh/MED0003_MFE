export function applyDialogOpen(open: boolean, close: () => void): void {
  if (!open) {
    close();
  }
}
