import { useRouter, useLocalSearchParams } from 'expo-router';
import ConfirmacaoAgendamentoScreen from '../screens/ConfirmacaoAgendamentoScreen';

export default function Confirmacao() {
  const router = useRouter();
  const { servico, dataTexto, hora } = useLocalSearchParams();

  return (
    <ConfirmacaoAgendamentoScreen
      servico={servico}
      dataTexto={dataTexto}
      hora={hora}
      onInicio={() => router.replace('/inicial')}
    />
  );
}