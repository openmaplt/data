import LoginForm from './_components/LoginForm';
import { loginAction } from './actions';

export default function LoginPage() {
  return <LoginForm loginAction={loginAction} />;
}
