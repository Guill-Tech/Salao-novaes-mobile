import { useRouter } from 'expo-router';
import PainelBarbeirosScreen from '../screens/PainelBarbeirosScreen';

export default function PainelBarbeiro() {
  const router = useRouter();
  return (
    <PainelBarbeirosScreen
      onAgenda={() => router.push('/visualizar-agenda')}
      onAgendamentos={() => router.push('/agendamentos-clientes')}
      onVoltar={() => router.back()}
    />
  );
}