import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import PainelBarbeirosScreen from '../screens/PainelBarbeirosScreen';
import { sair as sairDaConta } from '../services/autenticacao';

export default function PainelBarbeiro() {
  const router = useRouter();

  const voltarAoLogin = async () => {
    try {
      await sairDaConta();
      router.replace('/login-barbeiro');
    } catch (erro) {
      console.error('Não foi possível encerrar a sessão do barbeiro:', erro);
      Alert.alert('Não foi possível sair', 'Tente novamente em instantes.');
    }
  };

  return (
    <PainelBarbeirosScreen
      onAgenda={() => router.push('/visualizar-agenda')}
      onAgendamentos={() => router.push('/agendamentos-clientes')}
      onVoltar={voltarAoLogin}
    />
  );
}