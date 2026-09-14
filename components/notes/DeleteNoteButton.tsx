'use client';

import { useRef } from 'react';

export function DeleteNoteButton({ deleteAction }: { deleteAction: () => Promise<void> }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type='button'
        onClick={() => dialogRef.current?.showModal()}
        className='rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white'
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        className='m-auto rounded-md border border-black/15 p-6 backdrop:bg-black/30 dark:border-white/15 dark:bg-neutral-900'
      >
        <p className='text-sm'>Delete this note? This action cannot be undone.</p>
        <div className='mt-4 flex justify-end gap-2'>
          <button
            type='button'
            onClick={() => dialogRef.current?.close()}
            className='rounded-md border border-black/15 px-3 py-2 text-sm font-medium dark:border-white/15'
          >
            Cancel
          </button>
          <form action={deleteAction}>
            <button
              type='submit'
              className='rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white'
            >
              Delete
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
