import { useRouter } from 'expo-router';
import AgendamentosClientesScreen from '../screens/AgendamentosClientesScreen';

export default function AgendamentosClientes() {
  const router = useRouter();
  return <AgendamentosClientesScreen onVoltar={() => router.back()} />;
}