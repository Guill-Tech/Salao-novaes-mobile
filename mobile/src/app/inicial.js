
import { useRouter } from 'expo-router';
import InicialScreen from '../screens/InicialScreen';
 
export default function Inicial() {
  const router = useRouter();
 
  return <InicialScreen onEscolherServico={() => router.push('/servicos')} />;
}
 