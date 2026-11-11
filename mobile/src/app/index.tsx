import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import LoginScreen from '../screens/LoginScreen';

export default function Index() {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    // Pergunta ao Firebase se já existe alguém logado neste aparelho.
    const cancelar = onAuthStateChanged(auth, async (usuario) => {
      // Só interessa a primeira resposta, feita ao abrir o app.
      cancelar();

      if (!usuario) {
        setVerificando(false); // ninguém logado: mostra o login
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', usuario.uid));
        const tipo = snap.exists() ? snap.data().tipo : 'cliente';
        router.replace(tipo === 'barbeiro' ? '/painel-barbeiro' : '/inicial');
      } catch (e) {
        setVerificando(false); // se falhar a leitura, cai no login
      }
    });

    return cancelar;
  }, []);

  if (verificando) {
    return (
      <View style={{ flex: 1, backgroundColor: '#140808', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <LoginScreen
      onCadastro={() => router.push('/cadastro')}
      onEntrar={(perfil) =>
        router.replace(perfil.tipo === 'barbeiro' ? '/painel-barbeiro' : '/inicial')
      }
      onLoginBarbeiro={() => router.push('/login-barbeiro')}
    />
  );
}