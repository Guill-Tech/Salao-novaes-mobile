import { useRouter } from 'expo-router';
import CadastroScreen from '../screens/CadastroScreen';

export default function Cadastro() {
  const router = useRouter();

  return (
    <CadastroScreen
      onAvancar={() => {
        // Limpa a pilha (login + cadastro) antes de ir para a tela inicial.
        if (router.canDismiss()) router.dismissAll();
        router.replace('/inicial');
      }}
    />
  );
}