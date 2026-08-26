import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { Box } from '../elements/Box';
import { cn } from '../lib/cn';

export type TableProps = HTMLAttributes<HTMLTableElement>;

export function Table({ className, ...props }: TableProps) {
  return (
    <Box className="overflow-x-auto" data-slot="table-wrap">
      <table
        data-slot="table"
        className={cn(
          'w-full border-collapse text-left font-mm text-mm-body text-mm-text',
          className,
        )}
        {...props}
      />
    </Box>
  );
}

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <thead data-slot="table-header" className={cn(className)} {...props} />
  );
}

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody data-slot="table-body" className={cn(className)} {...props} />;
}

export type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

export function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn('border-b border-mm-border hover:bg-mm-bg', className)}
      {...props}
    />
  );
}

export type TableHeadProps = ThHTMLAttributes<HTMLTableCellElement>;

export function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn('py-2 pr-3 font-semibold', className)}
      {...props}
    />
  );
}

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>;

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn('py-2 pr-3', className)}
      {...props}
    />
  );
}
