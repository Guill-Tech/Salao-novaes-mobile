import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SelecionarDataHorarioScreen from '../screens/SelecionarDataHorarioScreen';

export default function Horarios() {
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