import { useRouter } from 'expo-router';
import ServicosScreen from '../screens/ServicosScreen';

export default function Servicos() {
  const router = useRouter();

  return (
    <ServicosScreen
      onConfirmar={(servico) =>
        router.push({
          pathname: '/data-horario',
          params: {
            serviceId: servico.id,
            nome: servico.nome
          },
        })
      }
    />
  );
}