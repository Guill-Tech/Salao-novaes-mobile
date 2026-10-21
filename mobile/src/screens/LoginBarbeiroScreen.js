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

// Props de navegação: onEntrar (vai ao painel) e onCadastro (vai ao cadastro)
export default function LoginBarbeiroScreen({ onEntrar, onCadastro }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  const handleEntrar = () => {
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

    // Login ainda simulado: só valida os campos.
    if (valido && onEntrar) onEntrar();
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

      <TouchableOpacity style={styles.botao} onPress={handleEntrar}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onCadastro}>
        <Text style={styles.link}>Cadastre-se aqui</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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