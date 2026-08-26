import type { HTMLAttributes, ReactNode } from 'react';
import { Box } from '../elements/Box';
import { Flex } from '../elements/Flex';
import { Heading } from '../elements/Heading';
import { Text } from '../elements/Text';
import { cn } from '../lib/cn';

export type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  children: ReactNode;
};

export function Card({ title, children, className, ...props }: CardProps) {
  return (
    <Box
      as="section"
      data-slot="card"
      className={cn(
        'rounded-mm border border-mm-border bg-mm-surface p-4 font-mm text-mm-text shadow-sm',
        className,
      )}
      {...props}
    >
      {title ? <CardTitle className="mb-3">{title}</CardTitle> : null}
      {children}
    </Box>
  );
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <Flex
      direction="column"
      gap="1"
      data-slot="card-header"
      className={cn('mb-3', className)}
      {...props}
    />
  );
}

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <Heading
      level={2}
      data-slot="card-title"
      className={cn(className)}
      {...props}
    />
  );
}

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <Text
      tone="muted"
      data-slot="card-description"
      className={cn(className)}
      {...props}
    />
  );
}

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function CardContent({ className, ...props }: CardContentProps) {
  return <Box data-slot="card-content" className={cn(className)} {...props} />;
}

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <Flex
      align="center"
      justify="end"
      gap="2"
      data-slot="card-footer"
      className={cn('mt-4', className)}
      {...props}
    />
  );
}
