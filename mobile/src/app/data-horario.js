import { useRouter, useLocalSearchParams } from 'expo-router';
import SelecionarDataHoraScreen from '../screens/SelecionarDataHoraScreen';
import { criarAgendamento, mensagemDeErro } from '../services/agendamento';

export default function DataHorario() {
  const router = useRouter();
  const { servicoId, servicoNome } = useLocalSearchParams();

  const agendar = async ({ data, dataTexto, hora }) => {
    try {
      await criarAgendamento({
        data,
        hora,
        serviceId: servicoId,
        serviceNome: servicoNome,
      });
      Alert.alert('Agendamento confirmado', `${servicoNome}\n${dataTexto} às ${hora}`);
    } catch (erro) {
      console.log('ERRO AGENDAR:', erro.code, erro.message);
      const msg = mensagemDeErro(erro);
      Alert.alert(msg.titulo, msg.texto);
    }
  };

  return <SelecionarDataHoraScreen onVoltar={() => router.back()} onAgendar={agendar} />;
}