import { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
} from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, fonts, spacing } from '../theme';

// onAvancar será ligado à navegação depois.
export default function CadastroScreen({ onAvancar = () => {} }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [numero, setNumero] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});

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

  function avancar() {
    if (!validar()) return;
    // Cadastro simulado. Na Sprint 2 isso vira Firebase Auth + Firestore.
    Alert.alert('Cadastro simulado', `Conta criada para ${nome}`);
    if (onAvancar) onAvancar({ nome, email, numero });
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

        <Button title="Avançar" onPress={avancar} />
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