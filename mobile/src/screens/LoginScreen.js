import { useState } from 'react';
import {
  View,
  Text,
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

// onCadastro e onLoginBarbeiro serão ligados à navegação depois.
export default function LoginScreen({ onCadastro, onLoginBarbeiro }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});

  function validar() {
    const novos = {};
    if (!email.includes('@')) novos.email = 'Digite um e-mail válido';
    if (senha.length < 6) novos.senha = 'A senha deve ter ao menos 6 caracteres';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function entrar() {
    if (!validar()) return;
    // Login simulado. Na Sprint 2 isso vira Firebase Auth.
    Alert.alert('Login simulado', `Bem-vindo, ${email}`);
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
        {/* Troque este círculo pela logo: exporte do Figma como PNG, salve
            em assets/logo.png e use <Image source={require(...)} /> */}
        <View style={styles.logo}>
          <Text style={styles.logoText}>BARBEARIA</Text>
        </View>

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

          <Button title="Entrar" onPress={entrar} style={styles.entrar} />

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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.textDark,
    fontWeight: 'bold',
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
