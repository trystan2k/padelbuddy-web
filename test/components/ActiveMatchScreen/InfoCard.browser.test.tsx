/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { InfoCard } from '@/components/ActiveMatchScreen/InfoCard/InfoCard';

describe('InfoCard', () => {
  test('renders with title', async () => {
    const screen = await render(
      <InfoCard isGoldenPoint={false} isSuperTiebreak={false} sideSwitchPrompts={false} />
    );

    await expect.element(screen.getByText('Court details')).toBeInTheDocument();
  });

  test('shows golden point off by default', async () => {
    const screen = await render(
      <InfoCard isGoldenPoint={false} isSuperTiebreak={false} sideSwitchPrompts={false} />
    );

    await expect.element(screen.getByText('Golden point off')).toBeInTheDocument();
  });

  test('shows golden point on when enabled', async () => {
    const screen = await render(
      <InfoCard isGoldenPoint={true} isSuperTiebreak={false} sideSwitchPrompts={false} />
    );

    await expect.element(screen.getByText('Golden point on')).toBeInTheDocument();
  });

  test('shows super tiebreak off by default', async () => {
    const screen = await render(
      <InfoCard isGoldenPoint={false} isSuperTiebreak={false} sideSwitchPrompts={false} />
    );

    await expect.element(screen.getByText('Super tiebreak off')).toBeInTheDocument();
  });

  test('shows super tiebreak on when enabled', async () => {
    const screen = await render(
      <InfoCard isGoldenPoint={false} isSuperTiebreak={true} sideSwitchPrompts={false} />
    );

    await expect.element(screen.getByText('Super tiebreak on')).toBeInTheDocument();
  });

  test('shows side-switch prompts off by default', async () => {
    const screen = await render(
      <InfoCard isGoldenPoint={false} isSuperTiebreak={false} sideSwitchPrompts={false} />
    );

    await expect.element(screen.getByText('Side-switch prompts: off')).toBeInTheDocument();
  });

  test('shows side-switch prompts on when enabled', async () => {
    const screen = await render(
      <InfoCard isGoldenPoint={false} isSuperTiebreak={false} sideSwitchPrompts={true} />
    );

    await expect.element(screen.getByText('Side-switch prompts: on')).toBeInTheDocument();
  });

  test('shows all options enabled', async () => {
    const screen = await render(
      <InfoCard isGoldenPoint={true} isSuperTiebreak={true} sideSwitchPrompts={true} />
    );

    await expect.element(screen.getByText('Golden point on')).toBeInTheDocument();
    await expect.element(screen.getByText('Super tiebreak on')).toBeInTheDocument();
    await expect.element(screen.getByText('Side-switch prompts: on')).toBeInTheDocument();
  });

  test('has test id', async () => {
    const screen = await render(
      <InfoCard isGoldenPoint={false} isSuperTiebreak={false} sideSwitchPrompts={false} />
    );

    await expect.element(screen.getByTestId('info-card')).toBeInTheDocument();
  });
});
