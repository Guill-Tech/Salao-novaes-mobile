import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import HeaderBarbeiro from '../components/HeaderBarbeiro';
import { cores } from '../theme/barbeiro';
import { ouvirProximosAgendamentos } from '../services/agenda';

const doisDigitos = (n) => String(n).padStart(2, '0');
const chaveHoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
};
const diaMes = (chave) => {
  const [, mes, dia] = String(chave).split('-');
  return `${dia}/${mes}`;
};


// Prop: onVoltar
export default function AgendamentosClientesScreen({ onVoltar }) {
  const [agendamentos, setAgendamentos] = useState([]);
const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState('');

useEffect(() => {
  const parar = ouvirProximosAgendamentos(
    chaveHoje(),
    (lista) => {
      setAgendamentos(lista);
      setCarregando(false);
    },
    () => {
      setErro('Não foi possível carregar os agendamentos.');
      setCarregando(false);
    }
  );
  return parar;
}, []);
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.cliente}>{item.clienteNome}</Text>
      <View style={styles.bloco}>
        <Text style={styles.blocoTexto}>
  {item.servicoNome} • {diaMes(item.data)} às {item.horaInicio}
</Text>
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

        {carregando ? (
  <ActivityIndicator size="large" color={cores.vinho} style={{ marginTop: 30 }} />
) : erro ? (
  <Text style={styles.mensagem}>{erro}</Text>
) : (
  <FlatList
    data={agendamentos}
    keyExtractor={(item) => item.id}
    renderItem={renderItem}
    showsVerticalScrollIndicator={false}
    ListEmptyComponent={<Text style={styles.mensagem}>Nenhum agendamento futuro.</Text>}
  />
)}
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
  mensagem: { textAlign: 'center', color: cores.cinzaTexto, marginTop: 24, fontSize: 14 },
});