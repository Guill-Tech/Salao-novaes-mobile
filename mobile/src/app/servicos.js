import { useRouter } from 'expo-router';
import ServicosScreen from '../screens/ServicosScreen';

export default function Servicos() {
  const router = useRouter();

  return (
    <ServicosScreen
      onVoltar={() => router.replace('/inicial')}
      onConfirmar={(servico) => {
        router.push({
          pathname: '/data-horario',
          params: {
            servicoId: servico.id,
            servicoNome: servico.nome,
            servicoPreco: String(servico.preco),
          },
        });
      }}
    />
  );
}
