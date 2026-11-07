import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { saiuPorConta } from '../services/autenticacao';

// Telas que podem ser abertas sem estar logado.
// As do barbeiro ficam aqui por enquanto, porque o login dele ainda é simulado.
const ROTAS_SEM_VERIFICACAO = [
  '/',
  '/cadastro',
  '/login-barbeiro',
  '/painel-barbeiro',
  '/visualizar-agenda',
  '/agendamentos-clientes',
];

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [pronto, setPronto] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const eraLogado = useRef(false);

  // Fica ouvindo o Firebase: entrou alguém? saiu alguém?
  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (usuario) => {
      setUsuarioId(usuario ? usuario.uid : null);
      setPronto(true);
    });
    return cancelar;
  }, []);

  // Toda vez que o login ou a tela muda, confere se pode estar ali.
  useEffect(() => {
    if (!pronto) return;

    if (auth.currentUser) {
      eraLogado.current = true;
      return;
    }

    if (eraLogado.current) {
      eraLogado.current = false;
      if (!saiuPorConta()) {
        Alert.alert('Sessão expirada', 'Sua sessão expirou, entre novamente.');
      }
    }

    if (!ROTAS_SEM_VERIFICACAO.includes(pathname)) {
      router.replace('/');
    }
  }, [pronto, usuarioId, pathname]);

  return <Stack screenOptions={{ headerShown: false }} />;
}