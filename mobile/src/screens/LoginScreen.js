import { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, fonts, spacing } from '../theme';
import { entrarNoApp, mensagemDeErroLogin } from '../services/autenticacao';

// onCadastro e onLoginBarbeiro serão ligados à navegação depois.
export default function LoginScreen({
  onCadastro = () => {},
  onLoginBarbeiro = () => {},
  onEntrar = () => {},
}) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  function validar() {
    const novos = {};
    if (!email.includes('@')) novos.email = 'Digite um e-mail válido';
    if (senha.length < 6) novos.senha = 'A senha deve ter ao menos 6 caracteres';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function entrar() {
  if (carregando) return;

  if (!validar()) return;

  setCarregando(true);

  try {
    const perfil = await entrarNoApp(email.trim(), senha);
    onEntrar(perfil);
  } catch (erro) {
    console.error('Erro detalhado no login:', erro);
    console.error('Código do erro:', erro?.code);
    console.error('Mensagem do erro:', erro?.message);

    Alert.alert(
      'Não foi possível entrar',
      mensagemDeErroLogin(erro?.code) ||
        'Ocorreu um erro inesperado. Consulte o terminal para ver os detalhes.'
    );
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
          source={require("../../assets/images/LOGO.png")} 
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.form}>
          <Input
            label="E-mail :"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={erros.email}
          />
          <Input
            label="Senha :"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            error={erros.senha}
          />

          <Button title={carregando ? 'Aguarde...' : 'Entrar'} onPress={entrar} style={styles.entrar} />
          <Pressable onPress={onCadastro}>
            <Text style={styles.link}>Cadastre-se aqui</Text>
          </Pressable>
        </View>

        <Button
          title="Login do Barbeiro"
          variant="outline"
          onPress={onLoginBarbeiro}
        />
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
  logo: {
    width: 140,
    height: 140,
    marginbottom: spacing.x1,
  },
  form: { width: '100%', alignItems: 'center', marginBottom: spacing.xl },
  entrar: { marginTop: spacing.md },
  link: {
    color: '#6EA8FF',
    fontSize: 13,
    textDecorationLine: 'underline',
    marginTop: spacing.md,
  },
});
