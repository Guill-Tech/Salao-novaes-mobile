import { useRouter } from 'expo-router';
import CadastroScreen from '../screens/CadastroScreen';

export default function Cadastro() {
  const router = useRouter();

  return <CadastroScreen onAvancar={() => router.replace('/inicial')} />;
}