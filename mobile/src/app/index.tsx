import { useRouter } from 'expo-router';
import LoginScreen from '../screens/LoginScreen';

export default function Index() {
  const router = useRouter();

  return (
    <LoginScreen
      onCadastro={() => router.push('/cadastro')}
      onEntrar={() => router.replace('/inicial')}
      onLoginBarbeiro={() => router.push('/login-barbeiro')}
    />
  );
}