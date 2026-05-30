import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { isAuthenticated } from '@/lib/auth';
import LoginForm from './_components/LoginForm';

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect('/');
  }

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
