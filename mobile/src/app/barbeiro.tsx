import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

/* ------------------------------------------------------------------ */
/* TIPOS                                                               */
/* ------------------------------------------------------------------ */
type Status = 'pendente' | 'concluido' | 'cancelado';

type Agendamento = {
  id: string;
  horario: string; // "09:00"
  cliente: string;
  servico: string;
  valor: number;
  status: Status;
};

type Filtro = 'todos' | Status;

/* ------------------------------------------------------------------ */
/* DADOS DE EXEMPLO                                                    */
/* TROQUE POR: chamada da API do projeto (veja carregarAgendamentos)   */
/* ------------------------------------------------------------------ */
const DADOS_EXEMPLO: Agendamento[] = [
  { id: '1', horario: '09:00', cliente: 'Carlos Silva', servico: 'Corte', valor: 40, status: 'concluido' },
  { id: '2', horario: '10:00', cliente: 'João Pereira', servico: 'Corte + Barba', valor: 65, status: 'pendente' },
  { id: '3', horario: '11:00', cliente: 'Marcos Lima', servico: 'Barba', valor: 30, status: 'pendente' },
  { id: '4', horario: '14:00', cliente: 'Rafael Souza', servico: 'Corte', valor: 40, status: 'pendente' },
  { id: '5', horario: '15:00', cliente: 'Pedro Alves', servico: 'Sobrancelha', valor: 15, status: 'cancelado' },
  { id: '6', horario: '16:30', cliente: 'Lucas Rocha', servico: 'Corte + Barba', valor: 65, status: 'pendente' },
];

// Quando o backend estiver pronto, substitua o conteúdo desta função:
// const resposta = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/agendamentos/hoje`);
// return await resposta.json();
async function carregarAgendamentos(): Promise<Agendamento[]> {
  return DADOS_EXEMPLO;
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
];

/* ------------------------------------------------------------------ */
/* TELA                                                                */
/* ------------------------------------------------------------------ */
export default function TelaBarbeiro() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(DADOS_EXEMPLO);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  // Para buscar da API ao abrir a tela, use:
  // useEffect(() => { carregarAgendamentos().then(setAgendamentos); }, []);

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

  function alterarStatus(id: string, status: Status) {
    // Quando houver API: envie a mudança ao servidor antes de atualizar a lista.
    setAgendamentos((atual) => atual.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  function confirmarCancelamento(item: Agendamento) {
    Alert.alert('Cancelar atendimento', `Cancelar o horário de ${item.cliente} às ${item.horario}?`, [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Cancelar atendimento', style: 'destructive', onPress: () => alterarStatus(item.id, 'cancelado') },
    ]);
  }

  function sair() {
    // Ajuste a rota se a tela de login tiver outro caminho.
    router.replace('/');
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
          <Text style={estilos.vazio}>Nenhum atendimento nesta lista. Troque o filtro para ver os demais.</Text>
        }
        renderItem={({ item }) => (
          <CartaoAgendamento
            item={item}
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
}: {
  item: Agendamento;
  onConcluir: () => void;
  onCancelar: () => void;
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
          <Pressable onPress={onCancelar} style={estilos.botaoContorno} accessibilityRole="button">
            <Text style={estilos.botaoContornoTexto}>Cancelar</Text>
          </Pressable>
          <Pressable onPress={onConcluir} style={estilos.botaoVinho} accessibilityRole="button">
            <Text style={estilos.botaoVinhoTexto}>Concluir</Text>
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
