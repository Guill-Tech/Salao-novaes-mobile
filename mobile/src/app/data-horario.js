import { Alert } from 'react-native';
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
        Alert.alert('Agendamento confirmado', `${nome}\n${dataTexto} às ${hora}`, [
          { text: 'OK', onPress: () => router.replace('/inicial') },
        ])
      }
    />
  );
}