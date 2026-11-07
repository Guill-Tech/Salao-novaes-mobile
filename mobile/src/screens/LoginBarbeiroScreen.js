import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { cores } from '../theme/barbeiro';
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
      <Image
        source={require('../../assets/images/LOGO.png')}
        style={styles.logo}
        resizeMode="cover"
      />
      <Text style={styles.logoTexto}>Barbeiro</Text>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail :</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {!!erroEmail && <Text style={styles.erro}>{erroEmail}</Text>}

        <Text style={styles.label}>Senha :</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
        {!!erroSenha && <Text style={styles.erro}>{erroSenha}</Text>}
      </View>

{!!erroGeral && <Text style={styles.erroGeral}>{erroGeral}</Text>}
<TouchableOpacity
  style={[styles.botao, carregando && { opacity: 0.5 }]}
  onPress={handleEntrar}
  disabled={carregando}
>
  <Text style={styles.botaoTexto}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
</TouchableOpacity>

      <TouchableOpacity onPress={onCadastro}>
        <Text style={styles.link}>Cadastre-se aqui</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  erroGeral: { color: cores.erro, fontSize: 12, marginTop: 20, textAlign: 'center', width: '70%' },
  container: {
    flex: 1,
    backgroundColor: cores.fundoEscuro,
    alignItems: 'center',
    paddingTop: 70,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F2EDE0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  logoTexto: {
    fontSize: 40,
    fontWeight: 'bold',
    color: cores.preto,
  },
  form: { width: '70%' },
  label: { color: cores.branco, fontSize: 14, marginTop: 10 },
  input: {
    backgroundColor: cores.cinzaBloco,
    height: 38,
    marginTop: 4,
    paddingHorizontal: 8,
    color: cores.branco,
  },
  erro: { color: cores.erro, fontSize: 11, marginTop: 2 },
  botao: {
    marginTop: 40,
    backgroundColor: cores.vinho,
    borderWidth: 1,
    borderColor: cores.vinhoBorda,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  botaoTexto: { color: cores.branco, fontSize: 20 },
  link: {
    color: cores.link,
    fontSize: 12,
    textDecorationLine: 'underline',
    marginTop: 40,
  },
});