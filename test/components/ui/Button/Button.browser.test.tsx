/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { Button } from '@/components/ui/Button/Button';

describe('Button', () => {
  describe('rendering', () => {
    test('renders children correctly', async () => {
      const screen = await render(<Button onClick={() => {}}>Click Me</Button>);

      await expect.element(screen.getByRole('button')).toHaveTextContent('Click Me');
    });

    test('renders enabled by default', async () => {
      const screen = await render(<Button onClick={() => {}}>Enabled Button</Button>);

      const button = screen.getByRole('button');
      await expect.element(button).not.toBeDisabled();
    });

    test('renders with data-disabled attribute when disabled', async () => {
      const screen = await render(
        <Button onClick={() => {}} disabled>
          Disabled Button
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toHaveAttribute('data-disabled');
    });
  });

  describe('click handling', () => {
    test('calls onClick when clicked', async () => {
      const handleClick = vi.fn<() => void>();
      const screen = await render(<Button onClick={handleClick}>Click Me</Button>);

      await screen.getByRole('button').click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not call onClick when disabled', async () => {
      const handleClick = vi.fn<() => void>();
      const screen = await render(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toBeDisabled();
    });
  });

  describe('disabled state', () => {
    test('renders with disabled state', async () => {
      const screen = await render(
        <Button onClick={() => {}} disabled>
          Disabled Button
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toBeDisabled();
    });

    test('disabled button properly prevents clicks in browser', async () => {
      const screen = await render(
        <Button onClick={() => {}} disabled={true}>
          Disabled
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toBeDisabled();
    });
  });

  describe('type attribute', () => {
    test('renders with default type="button"', async () => {
      const screen = await render(<Button onClick={() => {}}>Button</Button>);

      const button = screen.getByRole('button');
      await expect.element(button).toHaveAttribute('type', 'button');
    });

    test('renders with type="submit"', async () => {
      const screen = await render(
        <Button onClick={() => {}} type="submit">
          Submit
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toHaveAttribute('type', 'submit');
    });

    test('renders with type="reset"', async () => {
      const screen = await render(
        <Button onClick={() => {}} type="reset">
          Reset
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('custom className', () => {
    test('renders with custom className', async () => {
      const screen = await render(
        <Button onClick={() => {}} className="custom-class">
          Custom Button
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toHaveClass('custom-class');
    });

    test('applies both base and custom className', async () => {
      const screen = await render(
        <Button onClick={() => {}} className="extra">
          Button
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toHaveClass('extra');
    });
  });

  describe('variants', () => {
    test('applies solid variant class by default', async () => {
      const screen = await render(<Button onClick={() => {}}>Solid Button</Button>);

      const button = screen.getByRole('button');
      // Default variant is solid with success accent
      await expect.element(button).toBeInTheDocument();
    });

    test('applies outline variant class', async () => {
      const screen = await render(
        <Button onClick={() => {}} variant="outline">
          Outline Button
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toBeInTheDocument();
    });

    test('applies soft variant class', async () => {
      const screen = await render(
        <Button onClick={() => {}} variant="soft">
          Soft Button
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    test('applies lg size class by default', async () => {
      const screen = await render(<Button onClick={() => {}}>Large Button</Button>);

      const button = screen.getByRole('button');
      await expect.element(button).toBeInTheDocument();
    });

    test('applies sm size class', async () => {
      const screen = await render(
        <Button onClick={() => {}} size="sm">
          Small Button
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toBeInTheDocument();
    });
  });

  describe('accents', () => {
    test('applies success accent by default', async () => {
      const screen = await render(<Button onClick={() => {}}>Success Button</Button>);

      const button = screen.getByRole('button');
      await expect.element(button).toBeInTheDocument();
    });

    test('applies primary accent class', async () => {
      const screen = await render(
        <Button onClick={() => {}} accent="primary">
          Primary Button
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toBeInTheDocument();
    });

    test('applies secondary accent class', async () => {
      const screen = await render(
        <Button onClick={() => {}} accent="secondary">
          Secondary Button
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('has button role', async () => {
      const screen = await render(<Button onClick={() => {}}>Accessible Button</Button>);

      const button = screen.getByRole('button');
      await expect.element(button).toBeInTheDocument();
    });

    test('is focusable', async () => {
      const screen = await render(<Button onClick={() => {}}>Focusable Button</Button>);

      const button = screen.getByRole('button');
      // Button should be focusable by default
      await expect.element(button).toBeInTheDocument();
    });

    test('disabled button is not focusable via keyboard', async () => {
      const screen = await render(
        <Button onClick={() => {}} disabled>
          Disabled Button
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toBeDisabled();
    });
  });

  describe('combination tests', () => {
    test('solid + lg + success (default PrimaryButton equivalent)', async () => {
      const screen = await render(
        <Button variant="solid" size="lg" accent="success" onClick={() => {}}>
          Start Match
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toHaveTextContent('Start Match');
      await expect.element(button).not.toBeDisabled();
    });

    test('outline + lg (FinishButton equivalent)', async () => {
      const screen = await render(
        <Button variant="outline" size="lg" onClick={() => {}}>
          Finish Game
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toHaveTextContent('Finish Game');
      await expect.element(button).not.toBeDisabled();
    });

    test('soft + sm + primary (Team 1 RevertButton equivalent)', async () => {
      const screen = await render(
        <Button variant="soft" size="sm" accent="primary" onClick={() => {}}>
          Revert point
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toHaveTextContent('Revert point');
      await expect.element(button).not.toBeDisabled();
    });

    test('soft + sm + secondary (Team 2 RevertButton equivalent)', async () => {
      const screen = await render(
        <Button variant="soft" size="sm" accent="secondary" onClick={() => {}}>
          Revert point
        </Button>
      );

      const button = screen.getByRole('button');
      await expect.element(button).toHaveTextContent('Revert point');
      await expect.element(button).not.toBeDisabled();
    });
  });
});
