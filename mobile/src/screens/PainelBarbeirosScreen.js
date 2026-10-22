import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import HeaderBarbeiro from '../components/HeaderBarbeiro';
import { cores } from '../theme/barbeiro';

// Props: onAgenda, onAgendamentos, onVoltar
export default function PainelBarbeiroScreen({ onAgenda, onAgendamentos, onVoltar }) {
  return (
    <View style={styles.container}>
      <HeaderBarbeiro titulo={'Painel do\nBarbeiro'} />

      <View style={styles.conteudo}>
        <TouchableOpacity style={styles.cartao} onPress={onAgenda}>
          <Text style={styles.cartaoTexto}>Visualizar agenda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartao} onPress={onAgendamentos}>
          <Text style={styles.cartaoTexto}>Agendamentos</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoVoltar} onPress={onVoltar}>
        <Text style={styles.botaoVoltarTexto}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundoClaro, alignItems: 'center' },
  conteudo: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartao: {
    width: '78%',
    height: 72,
    backgroundColor: cores.cinzaCartao,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cartaoTexto: { fontSize: 16, color: cores.preto },
  botaoVoltar: {
    backgroundColor: cores.vinho,
    borderWidth: 1,
    borderColor: cores.vinhoBorda,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  botaoVoltarTexto: { color: cores.branco, fontSize: 16 },
});