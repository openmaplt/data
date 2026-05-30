'use server';

import { redirect } from 'next/navigation';
import { clearAuthSession } from '@/lib/auth';

export async function logoutAction() {
  await clearAuthSession();
  redirect('/');
}
