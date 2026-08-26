import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Container } from '../Container';
import { Fieldset } from '../Fieldset';
import { Flex } from '../Flex';
import { Form } from '../Form';
import { Grid } from '../Grid';
import { Heading } from '../Heading';
import { Separator } from '../Separator';
import { Text } from '../Text';
import { VisuallyHidden } from '../VisuallyHidden';

afterEach(() => {
  cleanup();
});

describe('layout elements', () => {
  it('renders flex, grid, and container variants', () => {
    render(
      <Container size="sm">
        <Flex direction="column" align="center" justify="between" wrap gap="4">
          <Grid cols="3" gap="2">
            <span>A</span>
          </Grid>
        </Flex>
      </Container>,
    );
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('covers remaining flex, grid, and container branches', () => {
    render(
      <>
        <Flex align="start" justify="start" gap="0">
          start
        </Flex>
        <Flex align="end" justify="end" gap="1" wrap={false}>
          end
        </Flex>
        <Flex align="baseline" justify="around" gap="6">
          around
        </Flex>
        <Flex align="stretch" justify="center" gap="3">
          stretch
        </Flex>
        <Flex gap="8">wide</Flex>
        <Grid cols="1" gap="0">
          one
        </Grid>
        <Grid cols="2" gap="1">
          two
        </Grid>
        <Grid cols="4" gap="3">
          four
        </Grid>
        <Grid cols="6" gap="6">
          six
        </Grid>
        <Grid cols="12" gap="8">
          twelve
        </Grid>
        <Container size="md">md</Container>
        <Container size="lg">lg</Container>
      </>,
    );
    expect(screen.getByText('twelve')).toBeTruthy();
  });
});

describe('text and chrome', () => {
  it('renders text tones and heading levels', () => {
    render(
      <>
        <Text>Default</Text>
        <Text tone="muted" size="sm">
          Muted
        </Text>
        <Text tone="error" size="lg">
          Error
        </Text>
        <Heading level={1}>One</Heading>
        <Heading level={2}>Two</Heading>
        <Heading level={3}>Three</Heading>
        <Heading level={4}>Four</Heading>
        <Heading level={5}>Five</Heading>
        <Heading level={6}>Six</Heading>
        <Heading as="h3" level={2}>
          Override
        </Heading>
        <Heading level={undefined}>Default</Heading>
        <Heading level={null}>Null level</Heading>
      </>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'One' })).toBeTruthy();
    expect(screen.getByText('Muted')).toBeTruthy();
  });

  it('renders form chrome and visually hidden copy', () => {
    render(
      <Form aria-label="Demo form">
        <Fieldset>
          <legend>PIN</legend>
          hidden
        </Fieldset>
        <Separator />
        <VisuallyHidden>Screen reader only</VisuallyHidden>
      </Form>,
    );
    expect(screen.getByRole('form', { name: 'Demo form' })).toBeTruthy();
    expect(screen.getByText('Screen reader only')).toBeTruthy();
  });
});
