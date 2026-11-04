import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { colors, fonts } from '../theme';

// Props:
//   servico   -> nome do serviço agendado
//   dataTexto -> data no formato DD/MM/AAAA
//   hora      -> horário no formato HH:mm
//   onInicio  -> chamado ao tocar no botão da casa
export default function ConfirmacaoAgendamentoScreen({
  servico,
  dataTexto,
  hora,
  onInicio = () => {},
}) {
  const [nomeCliente, setNomeCliente] = useState('');

  useEffect(() => {
    async function carregarNome() {
      try {
        const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        setNomeCliente(snap.exists() ? snap.data().nome : '');
      } catch (e) {
        setNomeCliente('');
      }
    }
    carregarNome();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/LOGO.png')}
        style={styles.logo}
        resizeMode="cover"
      />

      {/* Área do meio: ocupa todo o espaço livre e centraliza os campos nele */}
      <View style={styles.meio}>
        <View style={styles.dados}>
          <Linha rotulo="Nome :" valor={nomeCliente || '—'} />
          {/* Linha extra, não existe no Figma. Apague esta linha se quiser fiel ao Figma. */}
          <Linha rotulo="Serviço :" valor={servico} />
          <Linha rotulo="Data :" valor={dataTexto} />
          <Linha rotulo="Horário :" valor={hora} />
        </View>
      </View>

      <TouchableOpacity style={styles.botao} onPress={onInicio}>
        <Ionicons name="home-outline" size={36} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

function Linha({ rotulo, valor }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={styles.campo}>
        <Text style={styles.valor}>{valor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A8A8A8',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F2EDE0',
    marginBottom: 40,
  },
  meio: {
    flex: 1,
    width: '88%',
    justifyContent: 'center',
  },
  dados: { width: '100%' },
  linha: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  rotulo: {
    width: 95,
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  campo: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  valor: { fontSize: 16, color: colors.textDark },
  botao: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 50,
  },
});