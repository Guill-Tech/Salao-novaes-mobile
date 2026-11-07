import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import HeaderBarbeiro from '../components/HeaderBarbeiro';
import { cores } from '../theme/barbeiro';
import { ouvirAgendamentosDoDia } from '../services/agenda';

const doisDigitos = (n) => String(n).padStart(2, '0');
const chaveData = (d) =>
  `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
const textoData = (d) =>
  `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()}`;


// Prop: onVoltar
export default function VisualizarAgendaScreen({ onVoltar }) {
  const [dia, setDia] = useState(new Date());
const [agendamentos, setAgendamentos] = useState([]);
const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState('');

useEffect(() => {
  setCarregando(true);
  setErro('');
  const parar = ouvirAgendamentosDoDia(
    chaveData(dia),
    (lista) => {
      setAgendamentos(lista);
      setCarregando(false);
    },
    () => {
      setErro('Não foi possível carregar a agenda.');
      setCarregando(false);
    }
  );
  return parar;
}, [dia]);

const mudarDia = (delta) => {
  setDia(new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + delta));
};
  // Desenha cada linha da lista: horário pequeno em cima e bloco cinza embaixo
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.horario}>{item.horaInicio}</Text>
      <View style={styles.bloco}>
        <Text style={styles.blocoTexto}>
  {item.servicoNome} - {item.clienteNome}
</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderBarbeiro titulo={'Visualizar\nagenda'} />
    <View style={styles.navegacaoDia}>
  <TouchableOpacity onPress={() => mudarDia(-1)}>
    <Text style={styles.seta}>‹</Text>
  </TouchableOpacity>
  <Text style={styles.dataTexto}>{textoData(dia)}</Text>
  <TouchableOpacity onPress={() => mudarDia(1)}>
    <Text style={styles.seta}>›</Text>
  </TouchableOpacity>
</View>

      <View style={styles.cartao}>
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
    ListEmptyComponent={<Text style={styles.mensagem}>Nenhum agendamento neste dia.</Text>}
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
  navegacaoDia: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '70%',
  marginTop: 16,
},
seta: { fontSize: 32, color: cores.vinho, paddingHorizontal: 12 },
dataTexto: { fontSize: 18, color: cores.preto, fontWeight: 'bold' },
mensagem: { textAlign: 'center', color: cores.cinzaTexto, marginTop: 24, fontSize: 14 },
});