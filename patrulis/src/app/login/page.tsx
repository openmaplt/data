import { loginAction } from '@/lib/actions/auth';
import LoginForm from './_components/LoginForm';

export default function LoginPage() {
  return <LoginForm loginAction={loginAction} />;
}
