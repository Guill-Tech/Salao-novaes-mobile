import { useRouter, useLocalSearchParams } from 'expo-router';
import SelecionarDataHoraScreen from '../screens/SelecionarDataHoraScreen';

export default function DataHorario() {
  const router = useRouter();
  const { serviceId, nome } = useLocalSearchParams();

  return (
    <SelecionarDataHoraScreen
      servico={{ id: serviceId, nome }}
      onVoltar={() => router.back()}
      onAgendado={({ dataTexto, hora }) =>
        router.replace({
          pathname: '/confirmacao',
          params: {servico: nome, dataTexto, hora},
        })
      }
    />
  );
}