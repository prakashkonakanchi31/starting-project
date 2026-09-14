import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from '@/app/authentication/AuthForm';

const signInEmail = vi.fn();
const signUpEmail = vi.fn();

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: { email: (...args: unknown[]) => signInEmail(...args) },
    signUp: { email: (...args: unknown[]) => signUpEmail(...args) },
  },
}));

function fillAndSubmit({ email, password }: { email?: string; password?: string }) {
  if (email !== undefined) {
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  }
  if (password !== undefined) {
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
  }
  fireEvent.click(screen.getByRole('button'));
}

beforeEach(() => {
  signInEmail.mockReset();
  signUpEmail.mockReset();
  // @ts-expect-error - reassignable stub so onSuccess's hard navigation is observable
  delete window.location;
  window.location = { href: '' } as unknown as Location;
});

describe('AuthForm signin mode', () => {
  it('renders email and password only, with a link to signup', () => {
    render(<AuthForm mode='signin' />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Sign in');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/authentication?mode=signup');
  });

  it('blocks submit and shows field errors when empty', () => {
    render(<AuthForm mode='signin' />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it('calls signIn.email and redirects on success', async () => {
    signInEmail.mockImplementation((data, callbacks) => {
      callbacks.onSuccess();
      return Promise.resolve({ data: {}, error: null });
    });
    render(<AuthForm mode='signin' />);
    fillAndSubmit({ email: 'a@b.com', password: 'password123' });

    await waitFor(() => {
      expect(signInEmail).toHaveBeenCalledWith(
        { email: 'a@b.com', password: 'password123' },
        expect.any(Object),
      );
    });
    expect(window.location.href).toBe('/dashboard');
  });

  it('shows the server error message on failure', async () => {
    signInEmail.mockImplementation((data, callbacks) => {
      callbacks.onError({ error: { message: 'Invalid email or password' } });
      return Promise.resolve({ data: null, error: {} });
    });
    render(<AuthForm mode='signin' />);
    fillAndSubmit({ email: 'a@b.com', password: 'password123' });

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
});

describe('AuthForm signup mode', () => {
  it('renders email and password only, with a link to signin', () => {
    render(<AuthForm mode='signup' />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Create account');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/authentication?mode=signin');
  });

  it('blocks submit on a too-short password', () => {
    render(<AuthForm mode='signup' />);
    fillAndSubmit({ email: 'a@b.com', password: 'short' });
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
    expect(signUpEmail).not.toHaveBeenCalled();
  });

  it('calls signUp.email with a name derived from the email', async () => {
    signUpEmail.mockImplementation((data, callbacks) => {
      callbacks.onSuccess();
      return Promise.resolve({ data: {}, error: null });
    });
    render(<AuthForm mode='signup' />);
    fillAndSubmit({ email: 'ada@example.com', password: 'password123' });

    await waitFor(() => {
      expect(signUpEmail).toHaveBeenCalledWith(
        { email: 'ada@example.com', password: 'password123', name: 'ada' },
        expect.any(Object),
      );
    });
    expect(window.location.href).toBe('/dashboard');
  });
});
