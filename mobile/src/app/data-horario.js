import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SelecionarDataHoraScreen from '../screens/SelecionarDataHoraScreen';

export default function DataHorario() {
  const router = useRouter();
  // Serviço escolhido na tela anterior (opcional)
  const { servicoNome } = useLocalSearchParams();

  return (
    <SelecionarDataHoraScreen
      onVoltar={() => router.back()}
      onAgendar={({ dataTexto, hora }) =>
        // Por enquanto só mostra o resumo. A gravação no Firestore e a tela de
        // confirmação ficam para a Sprint 3.
        Alert.alert(
          'Horário escolhido',
          `${servicoNome ? servicoNome + '\n' : ''}${dataTexto} às ${hora}`
        )
      }
    />
  );
}