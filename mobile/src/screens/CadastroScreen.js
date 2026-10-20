import { useState } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, fonts, spacing } from '../theme';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

function mensagemDeErro(codigo) {
  switch (codigo) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/weak-password':
      return 'Senha muito fraca. Use ao menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet. Tente novamente.';
    case 'auth/operation-not-allowed':
      return 'O cadastro por e-mail ainda não está ativado no Firebase.';
    case 'permission-denied':
      return 'Sem permissão para salvar os dados. Avise a equipe.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
}

export default function CadastroScreen({ onAvancar = () => {} }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [numero, setNumero] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  function validar() {
    const novos = {};
    if (!nome.trim()) novos.nome = 'Informe seu nome';
    if (!email.includes('@')) novos.email = 'Digite um e-mail válido';
    // conta só os dígitos, ignorando parênteses, espaços e hífen
    if (numero.replace(/\D/g, '').length < 10) {
      novos.numero = 'Digite um número com DDD';
    }
    if (senha.length < 6) novos.senha = 'A senha deve ter ao menos 6 caracteres';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function avancar() {
  if (carregando) return;
  if (!validar()) return;

  setCarregando(true);
  try {
    const credencial = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      senha
    );

    await setDoc(doc(db, 'users', credencial.user.uid), {
      nome: nome.trim(),
      email: email.trim(),
      telefone: numero,
      tipo: 'cliente',
      criadoEm: serverTimestamp(),
    });

    Alert.alert('Cadastro realizado', `Bem-vindo, ${nome.trim()}!`, [
      { text: 'OK', onPress: () => onAvancar({ nome, email, numero }) },
    ]);
  } catch (erro) {
    Alert.alert('Não foi possível cadastrar', mensagemDeErro(erro.code));
  } finally {
    setCarregando(false);
  }
}

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../assets/images/LOGO.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.aviso}>*Preencha todos os campos</Text>

        <View style={styles.form}>
          <Input
            label="Nome :"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            error={erros.nome}
          />
          <Input
            label="E-mail :"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={erros.email}
          />
          <Input
            label="Número :"
            value={numero}
            onChangeText={setNumero}
            keyboardType="phone-pad"
            error={erros.numero}
          />
          <Input
            label="Senha :"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            error={erros.senha}
          />
        </View>

        <Button title={carregando ? 'Aguarde...' : ' Avançar'} onPress={avancar} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logo: { width: 120, height: 120, marginBottom: spacing.md },
  aviso: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  form: { width: '100%', marginBottom: spacing.lg },
});