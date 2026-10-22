import { Alert } from 'react-native';
import ServicosScreen from '../screens/ServicosScreen';
 
export default function Servicos() {
  return (
    <ServicosScreen
      // Temporário: quando a tela de horários existir, vira router.push('/horarios').
      onConfirmar={(servico) => Alert.alert('Serviço escolhido', servico.nome)}
    />
  );
}
 