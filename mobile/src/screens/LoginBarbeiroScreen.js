import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, spacing } from '../theme';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// Props de navegação: onEntrar (vai ao painel) e onCadastro (vai ao cadastro)
export default function LoginBarbeiroScreen({ onEntrar, onCadastro }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');
  const handleEntrar = async () => {
    let valido = true;

    if (!email.trim()) {
      setErroEmail('Digite seu e-mail corporativo');
      valido = false;
    } else {
      setErroEmail('');
    }

    if (!senha.trim()) {
      setErroSenha('Digite sua senha corporativa');
      valido = false;
    } else {
      setErroSenha('');
    }

   if (!valido) return;
   setCarregando(true);
setErroGeral('');
try {
  const credencial = await signInWithEmailAndPassword(auth, email.trim(), senha);
  const perfil = await getDoc(doc(db, 'users', credencial.user.uid));
  if (!perfil.exists() || perfil.data().tipo !== 'barbeiro') {
    await signOut(auth);
    setErroGeral('Esta conta não tem acesso ao painel do barbeiro.');
    return;
  }
  if (onEntrar) onEntrar();
} catch (erro) {
  setErroGeral('E-mail ou senha incorretos.');
} finally {
  setCarregando(false);
}
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../assets/images/LOGO.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.titulo}>Barbeiro</Text>

        <View style={styles.form}>
          <Input
            label="E-mail :"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            error={erroEmail}
          />
          <Input
            label="Senha :"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoComplete="current-password"
            error={erroSenha}
          />
        </View>

        {!!erroGeral && <Text style={styles.erroGeral}>{erroGeral}</Text>}
        <Button
          title={carregando ? 'Entrando...' : 'Entrar'}
          onPress={handleEntrar}
          style={styles.botaoEntrar}
        />

        <TouchableOpacity onPress={onCadastro}>
          <Text style={styles.link}>Cadastre-se aqui</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  conteudo: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: spacing.md,
  },
  titulo: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  erroGeral: {
    color: colors.error,
    fontSize: 12,
    marginBottom: spacing.md,
    textAlign: 'center',
    width: '100%',
  },
  botaoEntrar: { marginTop: spacing.md },
  link: {
    color: '#6EA8FF',
    fontSize: 13,
    textDecorationLine: 'underline',
    marginTop: spacing.md,
  },
});
