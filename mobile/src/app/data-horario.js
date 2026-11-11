import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SelecionarDataHoraScreen from '../screens/SelecionarDataHoraScreen';

export default function DataHorario() {
  const router = useRouter();
  const { servicoId, servicoNome, servicoPreco } = useLocalSearchParams();
  const id = Array.isArray(servicoId) ? servicoId[0] : servicoId;
  const nome = Array.isArray(servicoNome) ? servicoNome[0] : servicoNome;
  const precoParam = Array.isArray(servicoPreco) ? servicoPreco[0] : servicoPreco;
  const preco = Number(precoParam);
  const servicoValido = Boolean(id && nome);

  useEffect(() => {
    if (!servicoValido) router.replace('/servicos');
  }, [router, servicoValido]);

  if (!servicoValido) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SelecionarDataHoraScreen
      servico={{ id, nome, preco: Number.isFinite(preco) ? preco : 0 }}
      onVoltar={() => router.replace('/servicos')}
      onAgendado={({ dataTexto, hora }) =>
        router.replace({
          pathname: '/confirmacao',
          params: { servico: nome || '', dataTexto, hora },
        })
      }
    />
  );
}