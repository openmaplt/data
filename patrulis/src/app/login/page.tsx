import { redirect } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth';
import { isAuthenticated } from '@/lib/auth';
import LoginForm from './_components/LoginForm';

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect('/');
  }

  return <LoginForm loginAction={loginAction} />;
}
