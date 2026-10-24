import { useRouter } from 'expo-router';
import InicialScreen from '../screens/InicialScreen';
import { sair } from '../services/autenticacao';

export default function Inicial() {
  const router = useRouter();

  return (
    <InicialScreen
      onEscolherServico={() => router.push('/servicos')}
      onSair={async () => {
        await sair();
        router.replace('/');
      }}
    />
  );
}