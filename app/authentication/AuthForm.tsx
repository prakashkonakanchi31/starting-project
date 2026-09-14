'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import {
  deriveNameFromEmail,
  validateAuthForm,
  type AuthFormErrors,
  type AuthMode,
} from '@/app/lib/auth-validation';

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<AuthFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const { valid, errors } = validateAuthForm({ mode, email, password });
    setFieldErrors(errors);
    if (!valid) return;

    const callbacks = {
      onRequest: () => setIsSubmitting(true),
      onSuccess: () => {
        // A hard navigation (not router.push) so the root layout's
        // session-dependent Header re-renders server-side with the
        // just-created session, instead of reusing the signed-out
        // layout the client router cached before login.
        window.location.href = '/dashboard';
      },
      onError: (ctx: { error: { message: string } }) => {
        setIsSubmitting(false);
        setFormError(ctx.error.message);
      },
    };

    if (isSignup) {
      await authClient.signUp.email(
        { email, password, name: deriveNameFromEmail(email) },
        callbacks,
      );
    } else {
      await authClient.signIn.email({ email, password }, callbacks);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-4'>
      {formError && (
        <p role='alert' className='rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600'>
          {formError}
        </p>
      )}

      <div className='flex flex-col gap-1'>
        <label htmlFor='email' className='text-sm font-medium'>
          Email
        </label>
        <input
          id='email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15'
        />
        {fieldErrors.email && <p className='text-sm text-red-600'>{fieldErrors.email}</p>}
      </div>

      <div className='flex flex-col gap-1'>
        <label htmlFor='password' className='text-sm font-medium'>
          Password
        </label>
        <input
          id='password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15'
        />
        {fieldErrors.password && <p className='text-sm text-red-600'>{fieldErrors.password}</p>}
      </div>

      <button
        type='submit'
        disabled={isSubmitting}
        className='rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50'
      >
        {isSignup ? 'Create account' : 'Sign in'}
      </button>

      <p className='text-center text-sm'>
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link href='/authentication?mode=signin' className='underline'>
              Sign in
            </Link>
          </>
        ) : (
          <>
            Need an account?{' '}
            <Link href='/authentication?mode=signup' className='underline'>
              Sign up
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
