import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import InicialScreen from '../screens/InicialScreen';
import { ouvirMeusAgendamentos, cancelarAgendamento, podeCancelar } from '../services/meusAgendamentos';
import { auth, db } from '../services/firebase';
import { sair as sairDaConta } from '../services/autenticacao';

// '2026-11-12' -> '12/11'
const diaMes = (chave) => {
  const [, mes, dia] = String(chave).split('-');
  return `${dia}/${mes}`;
};

export default function Inicial() {
  const router = useRouter();
  const [nomeCliente, setNomeCliente] = useState('Cliente');
  const [agendamentos, setAgendamentos] = useState([]);
  const [erroAgendamentos, setErroAgendamentos] = useState('');

  useEffect(() => {
    let ativo = true;
    const usuario = auth.currentUser;

    if (usuario) {
      getDoc(doc(db, 'users', usuario.uid))
        .then((perfil) => {
          if (ativo && perfil.exists()) {
            setNomeCliente(perfil.data().nome || 'Cliente');
          }
        })
        .catch((erro) => {
          console.error('Não foi possível carregar o perfil do cliente:', erro);
        });
    }

    return () => {
      ativo = false;
    };
  }, []);

  // Escuta, em tempo real, os agendamentos futuros do cliente logado
  useEffect(() => {
    const parar = ouvirMeusAgendamentos(
      (lista) => {
        setErroAgendamentos('');
        setAgendamentos(
          lista.map((a) => ({
            id: a.id,
            servico: a.servicoNome || 'Serviço',
            data: diaMes(a.data),
            hora: a.horaInicio,
            podeCancelar: podeCancelar(a),
            original: a, // guardado para o cancelamento
          }))
        );
      },
      (erro) => {
        console.error('Não foi possível carregar os agendamentos do cliente:', erro);
        setErroAgendamentos('Não foi possível carregar seus agendamentos. Tente novamente.');
      }
    );
    return parar;
  }, []);

  // Pede confirmação e cancela, se estiver dentro do prazo
  const cancelar = (id) => {
    const item = agendamentos.find((a) => a.id === id);
    if (!item) return;

    Alert.alert(
      'Cancelar agendamento',
      `Cancelar ${item.servico} em ${item.data} às ${item.hora}?`,
      [
        { text: 'Manter', style: 'cancel' },
        {
          text: 'Cancelar agendamento',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelarAgendamento(item.original);
            } catch (erro) {
              console.log('ERRO CANCELAR:', erro.code, erro.message);
              if (erro.message === 'PRAZO_CANCELAMENTO') {
                Alert.alert('Prazo encerrado', 'O cancelamento só é possível com pelo menos 24 horas de antecedência.');
              } else {
                Alert.alert('Não foi possível cancelar', 'Tente novamente em instantes.');
              }
            }
          },
        },
      ]
    );
  };

  const sair = async () => {
    try {
      await sairDaConta();
      router.replace('/');
    } catch (erro) {
      console.error('Não foi possível sair da conta:', erro);
      Alert.alert('Não foi possível sair', 'Tente novamente em instantes.');
    }
  };

  return (
    <InicialScreen
      nomeCliente={nomeCliente}
      agendamentos={agendamentos}
      erroAgendamentos={erroAgendamentos}
      onCancelar={cancelar}
      onEscolherServico={() => router.push('/servicos')}
      onSair={sair}
    />
  );
}