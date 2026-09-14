'use client';

import { useActionState, useState } from 'react';
import type { ShareState } from '@/app/notes/[id]/actions';

export function ShareToggle({
  toggleAction,
  initialIsPublic,
  initialPublicSlug,
}: {
  toggleAction: (prevState: ShareState, formData: FormData) => Promise<ShareState>;
  initialIsPublic: boolean;
  initialPublicSlug: string | null;
}) {
  const [state, formAction, isPending] = useActionState(toggleAction, {
    isPublic: initialIsPublic,
    publicSlug: initialPublicSlug,
  });
  const [copied, setCopied] = useState(false);

  const publicUrl =
    state.publicSlug && typeof window !== 'undefined'
      ? `${window.location.origin}/p/${state.publicSlug}`
      : state.publicSlug
        ? `/p/${state.publicSlug}`
        : null;

  async function handleCopy() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className='flex flex-col gap-2 rounded-md border border-black/15 p-3 dark:border-white/15'>
      {state.error && (
        <p role='alert' className='text-sm text-red-600'>
          {state.error}
        </p>
      )}
      <form action={formAction} className='flex items-center gap-2'>
        <input type='hidden' name='isPublic' value={state.isPublic ? 'false' : 'true'} />
        <label className='flex items-center gap-2 text-sm font-medium'>
          <input
            type='checkbox'
            checked={state.isPublic}
            disabled={isPending}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            readOnly
          />
          Public sharing
        </label>
      </form>

      {state.isPublic && publicUrl && (
        <div className='flex items-center gap-2 text-sm'>
          <input
            readOnly
            value={publicUrl}
            className='flex-1 rounded-md border border-black/15 bg-transparent px-2 py-1 text-xs dark:border-white/15'
          />
          <button
            type='button'
            onClick={handleCopy}
            className='rounded-md border border-black/15 px-2 py-1 text-xs font-medium dark:border-white/15'
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}
