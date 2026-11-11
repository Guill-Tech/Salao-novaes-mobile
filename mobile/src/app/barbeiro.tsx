import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { atualizarStatusAgendamento, ouvirAgendamentosDoDia } from '../services/agenda';
import { sair as sairDaConta } from '../services/autenticacao';

/* ------------------------------------------------------------------ */
/* TIPOS                                                               */
/* ------------------------------------------------------------------ */
type Status = 'pendente' | 'concluido' | 'cancelado';

type Agendamento = {
  id: string;
  data: string;
  barbeiroId: string;
  horaInicio: string;
  horario: string; // "09:00"
  cliente: string;
  servico: string;
  valor: number;
  status: Status;
};

type AgendamentoDoFirestore = {
  id: string;
  data: string;
  barbeiroId: string;
  horaInicio: string;
  clienteNome: string;
  servicoNome: string;
  servicoPreco?: number;
  status: string;
};

type Filtro = 'todos' | Status;

function chaveDeHoje() {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${hoje.getFullYear()}-${mes}-${dia}`;
}

/* ------------------------------------------------------------------ */
/* CORES (iguais às da tela de login)                                  */
/* ------------------------------------------------------------------ */
const cores = {
  fundo: '#100808',
  card: '#1c1111',
  borda: '#3a2222',
  texto: '#f5efe9',
  textoSuave: '#a89a94',
  vinho: '#651a1a',
  vinhoBorda: '#8a2a2a',
  erro: '#e57373',
  sucesso: '#7fbf7f',
};

const fonteSerif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

const FILTROS: { chave: Filtro; rotulo: string }[] = [
  { chave: 'todos', rotulo: 'Todos' },
  { chave: 'pendente', rotulo: 'Pendentes' },
  { chave: 'concluido', rotulo: 'Concluídos' },
  { chave: 'cancelado', rotulo: 'Cancelados' },
];

/* ------------------------------------------------------------------ */
/* TELA                                                                */
/* ------------------------------------------------------------------ */
export default function TelaBarbeiro() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const dataChave = chaveDeHoje();

  useEffect(() => {
    const parar = ouvirAgendamentosDoDia(
      dataChave,
      (lista: AgendamentoDoFirestore[]) => {
        const novosAgendamentos: Agendamento[] = lista.map((item) => ({
            ...item,
            horario: item.horaInicio,
            cliente: item.clienteNome,
            servico: item.servicoNome,
            valor: Number(item.servicoPreco || 0),
            status:
              item.status === 'cancelado'
                ? 'cancelado'
                : item.status === 'concluido'
                  ? 'concluido'
                  : 'pendente',
          }));
        setAgendamentos(novosAgendamentos);
        setErro('');
        setCarregando(false);
      },
      (erroCarga: unknown) => {
        console.error('Não foi possível carregar a agenda do barbeiro:', erroCarga);
        setErro('Não foi possível carregar os atendimentos. Tente novamente.');
        setCarregando(false);
      },
      { incluirCancelados: true }
    );

    return parar;
  }, [dataChave]);

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  const lista = useMemo(
    () => (filtro === 'todos' ? agendamentos : agendamentos.filter((a) => a.status === filtro)),
    [agendamentos, filtro]
  );

  const resumo = useMemo(() => {
    const ativos = agendamentos.filter((a) => a.status !== 'cancelado');
    const concluidos = agendamentos.filter((a) => a.status === 'concluido');
    return {
      total: ativos.length,
      concluidos: concluidos.length,
      faturado: concluidos.reduce((soma, a) => soma + a.valor, 0),
    };
  }, [agendamentos]);

  async function alterarStatus(id: string, status: Status) {
    const item = agendamentos.find((agendamento) => agendamento.id === id);
    if (!item || atualizandoId) return;

    setAtualizandoId(id);
    try {
      await atualizarStatusAgendamento(item, status);
    } catch (erroStatus) {
      console.error('Não foi possível atualizar o atendimento:', erroStatus);
      Alert.alert('Não foi possível atualizar', 'Tente novamente em instantes.');
    } finally {
      setAtualizandoId(null);
    }
  }

  function confirmarCancelamento(item: Agendamento) {
    Alert.alert('Cancelar atendimento', `Cancelar o horário de ${item.cliente} às ${item.horario}?`, [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar atendimento',
        style: 'destructive',
        onPress: () => alterarStatus(item.id, 'cancelado'),
      },
    ]);
  }

  async function sair() {
    try {
      await sairDaConta();
      router.replace('/login-barbeiro');
    } catch (erroSaida) {
      console.error('Não foi possível encerrar a sessão do barbeiro:', erroSaida);
      Alert.alert('Não foi possível sair', 'Tente novamente em instantes.');
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        contentContainerStyle={estilos.conteudo}
        ListHeaderComponent={
          <View>
            <View style={estilos.topo}>
              <View>
                <Text style={estilos.titulo}>Minha agenda</Text>
                <Text style={estilos.data}>{hoje}</Text>
              </View>
              <Pressable onPress={sair} hitSlop={10} accessibilityRole="button">
                <Text style={estilos.sair}>Sair</Text>
              </Pressable>
            </View>

            <View style={estilos.resumo}>
              <View style={estilos.resumoItem}>
                <Text style={estilos.resumoValor}>{resumo.total}</Text>
                <Text style={estilos.resumoRotulo}>Clientes hoje</Text>
              </View>
              <View style={estilos.resumoItem}>
                <Text style={estilos.resumoValor}>{resumo.concluidos}</Text>
                <Text style={estilos.resumoRotulo}>Atendidos</Text>
              </View>
              <View style={estilos.resumoItem}>
                <Text style={estilos.resumoValor}>R$ {resumo.faturado}</Text>
                <Text style={estilos.resumoRotulo}>Faturado</Text>
              </View>
            </View>

            <View style={estilos.filtros}>
              {FILTROS.map((f) => {
                const ativo = filtro === f.chave;
                return (
                  <Pressable
                    key={f.chave}
                    onPress={() => setFiltro(f.chave)}
                    style={[estilos.filtro, ativo && estilos.filtroAtivo]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativo }}
                  >
                    <Text style={[estilos.filtroTexto, ativo && estilos.filtroTextoAtivo]}>{f.rotulo}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator size="large" color={cores.texto} />
          ) : erro ? (
            <Text style={estilos.vazio}>{erro}</Text>
          ) : (
            <Text style={estilos.vazio}>
              Nenhum atendimento nesta lista. Troque o filtro para ver os demais.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <CartaoAgendamento
            item={item}
            desabilitado={atualizandoId === item.id}
            onConcluir={() => alterarStatus(item.id, 'concluido')}
            onCancelar={() => confirmarCancelamento(item)}
          />
        )}
      />
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* CARTÃO DE CADA AGENDAMENTO                                          */
/* ------------------------------------------------------------------ */
function CartaoAgendamento({
  item,
  onConcluir,
  onCancelar,
  desabilitado,
}: {
  item: Agendamento;
  onConcluir: () => void;
  onCancelar: () => void;
  desabilitado: boolean;
}) {
  const pendente = item.status === 'pendente';
  const apagado = item.status === 'cancelado';

  return (
    <View style={[estilos.cartao, apagado && { opacity: 0.55 }]}>
      <View style={estilos.cartaoLinha}>
        <Text style={estilos.horario}>{item.horario}</Text>
        <View style={estilos.cartaoInfo}>
          <Text style={estilos.cliente}>{item.cliente}</Text>
          <Text style={estilos.servico}>
            {item.servico} - R$ {item.valor}
          </Text>
        </View>
        {!pendente && (
          <Text style={[estilos.status, { color: item.status === 'concluido' ? cores.sucesso : cores.erro }]}>
            {item.status === 'concluido' ? 'Concluído' : 'Cancelado'}
          </Text>
        )}
      </View>

      {pendente && (
        <View style={estilos.acoes}>
          <Pressable
            onPress={onCancelar}
            style={estilos.botaoContorno}
            accessibilityRole="button"
            disabled={desabilitado}
          >
            <Text style={estilos.botaoContornoTexto}>Cancelar</Text>
          </Pressable>
          <Pressable
            onPress={onConcluir}
            style={estilos.botaoVinho}
            accessibilityRole="button"
            disabled={desabilitado}
          >
            <Text style={estilos.botaoVinhoTexto}>
              {desabilitado ? 'Salvando...' : 'Concluir'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ESTILOS                                                             */
/* ------------------------------------------------------------------ */
const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, paddingBottom: 48 },

  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  titulo: { fontFamily: fonteSerif, fontSize: 30, color: cores.texto },
  data: { fontFamily: fonteSerif, fontSize: 15, color: cores.textoSuave, marginTop: 4 },
  sair: { fontFamily: fonteSerif, fontSize: 16, color: '#6ea8fe', textDecorationLine: 'underline', paddingTop: 8 },

  resumo: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 14,
    backgroundColor: cores.card,
    marginBottom: 20,
  },
  resumoItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  resumoValor: { fontFamily: fonteSerif, fontSize: 22, color: cores.texto },
  resumoRotulo: { fontFamily: fonteSerif, fontSize: 13, color: cores.textoSuave, marginTop: 2 },

  filtros: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filtro: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  filtroAtivo: { backgroundColor: cores.vinho, borderColor: cores.vinhoBorda },
  filtroTexto: { fontFamily: fonteSerif, fontSize: 15, color: cores.textoSuave },
  filtroTextoAtivo: { color: cores.texto },

  cartao: {
    backgroundColor: cores.card,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cartaoLinha: { flexDirection: 'row', alignItems: 'center' },
  horario: { fontFamily: fonteSerif, fontSize: 22, color: cores.texto, width: 72 },
  cartaoInfo: { flex: 1 },
  cliente: { fontFamily: fonteSerif, fontSize: 18, color: cores.texto },
  servico: { fontFamily: fonteSerif, fontSize: 14, color: cores.textoSuave, marginTop: 2 },
  status: { fontFamily: fonteSerif, fontSize: 14 },

  acoes: { flexDirection: 'row', gap: 10, marginTop: 14 },
  botaoVinho: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: cores.vinho,
    borderWidth: 1,
    borderColor: cores.vinhoBorda,
  },
  botaoVinhoTexto: { fontFamily: fonteSerif, fontSize: 16, color: cores.texto },
  botaoContorno: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: cores.textoSuave,
  },
  botaoContornoTexto: { fontFamily: fonteSerif, fontSize: 16, color: cores.texto },

  vazio: { fontFamily: fonteSerif, fontSize: 15, color: cores.textoSuave, textAlign: 'center', marginTop: 32 },
});
