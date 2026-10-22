import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import HeaderBarbeiro from '../components/HeaderBarbeiro';
import { cores } from '../theme/barbeiro';

// Dados de exemplo. Depois virão do Firestore.
const AGENDAMENTOS = [
  { id: '1', cliente: 'João Silva', info: 'Corte social • 20/10 às 09:00' },
  { id: '2', cliente: 'Pedro Santos', info: 'Barba • 20/10 às 10:00' },
  { id: '3', cliente: 'Lucas Lima', info: 'Corte + barba • 20/10 às 11:00' },
  { id: '4', cliente: 'Marcos Souza', info: 'Corte degradê • 21/10 às 14:00' },
];

// Prop: onVoltar
export default function AgendamentosClientesScreen({ onVoltar }) {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.cliente}>{item.cliente}</Text>
      <View style={styles.bloco}>
        <Text style={styles.blocoTexto}>{item.info}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderBarbeiro titulo="Agendamentos!" />

      <View style={styles.cartao}>
        {/* Barra escura do topo, como no wireframe */}
        <View style={styles.pilula}>
          <Text style={styles.pilulaTexto}>Próximos atendimentos</Text>
        </View>

        <FlatList
          data={AGENDAMENTOS}
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
  pilula: {
    backgroundColor: '#333333',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pilulaTexto: { color: cores.branco, fontSize: 14 },
  item: { marginBottom: 10 },
  cliente: { fontSize: 12, color: cores.cinzaTexto, marginBottom: 3 },
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