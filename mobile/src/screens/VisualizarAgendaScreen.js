import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import HeaderBarbeiro from '../components/HeaderBarbeiro';
import { cores } from '../theme/barbeiro';

// Dados de exemplo. Depois serão lidos da coleção appointments do Firestore.
const AGENDA = [
  { id: '1', horario: '09:00', descricao: 'Corte social - João Silva' },
  { id: '2', horario: '10:00', descricao: 'Barba - Pedro Santos' },
  { id: '3', horario: '11:00', descricao: 'Corte + barba - Lucas Lima' },
  { id: '4', horario: '14:00', descricao: 'Corte degradê - Marcos Souza' },
  { id: '5', horario: '15:00', descricao: 'Horário livre' },
];

// Prop: onVoltar
export default function VisualizarAgendaScreen({ onVoltar }) {
  // Desenha cada linha da lista: horário pequeno em cima e bloco cinza embaixo
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.horario}>{item.horario}</Text>
      <View style={styles.bloco}>
        <Text style={styles.blocoTexto}>{item.descricao}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderBarbeiro titulo={'Visualizar\nagenda'} />

      <View style={styles.cartao}>
        <FlatList
          data={AGENDA}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <TouchableOpacity style={styles.botaoVoltar} onPress={onVoltar}>
        <Text style={styles.botaoVoltarTexto}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundoClaro, alignItems: 'center' },
  cartao: {
    flex: 1,
    width: '86%',
    backgroundColor: cores.cinzaCartao,
    borderRadius: 24,
    marginTop: 24,
    padding: 14,
  },
  item: { marginBottom: 10 },
  horario: { fontSize: 12, color: cores.cinzaTexto, marginBottom: 3 },
  bloco: {
    backgroundColor: cores.cinzaBloco,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  blocoTexto: { color: cores.branco, fontSize: 13 },
  botaoVoltar: {
    backgroundColor: cores.vinho,
    borderWidth: 1,
    borderColor: cores.vinhoBorda,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginVertical: 14,
  },
  botaoVoltarTexto: { color: cores.branco, fontSize: 16 },
});