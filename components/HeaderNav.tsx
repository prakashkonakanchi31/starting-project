'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function HeaderNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();

  if (!isAuthenticated && pathname === '/') {
    return (
      <Link href='/authentication' className='text-sm underline'>
        Login
      </Link>
    );
  }

  if (isAuthenticated && pathname !== '/authentication') {
    return (
      <Link href='/logout' className='text-sm underline'>
        Log out
      </Link>
    );
  }

  return null;
}
