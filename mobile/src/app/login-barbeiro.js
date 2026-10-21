import { useRouter } from 'expo-router';
import LoginBarbeiroScreen from '../screens/LoginBarbeiroScreen';

export default function LoginBarbeiro() {
  const router = useRouter();

  return <LoginBarbeiroScreen onAvancar={() => router.push('/login-barbeiro')} />;
}