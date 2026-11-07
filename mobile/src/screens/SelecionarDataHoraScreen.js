import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { gerarHorarios, horariosLivres } from '../services/horarios';
import {
  buscarExpediente,
  buscarOcupadosDoMes,
  criarAgendamento,
  mensagemDeErroAgendamento,
} from '../services/agendamentos';

// O expediente (horários, intervalo e dias abertos) agora vem do Firestore,
// do documento configuracao/expediente. Aqui só ficam as opções da tela.
const MESES_A_FRENTE = 3; // até quantos meses à frente dá para navegar

const cores = {
  fundo: '#A8A8A8',
  cartao: '#F2F2F2',
  vinho: '#4A0F10',
  vinhoBorda: '#8B2A2A',
  azul: '#2F80ED',
  azulClaro: '#CFE3FA',
  texto: '#111111',
  textoSuave: '#888888',
  branco: '#FFFFFF',
};

const NOMES_MES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const doisDigitos = (n) => String(n).padStart(2, '0');

// Chave AAAA-MM-DD (usada para montar o ID do agendamento)
const chaveData = (d) =>
  `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;

// Texto DD/MM/AAAA (para mostrar ao cliente)
const textoData = (d) =>
  `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()}`;

const mesmoDia = (a, b) => chaveData(a) === chaveData(b);

// Horários livres de um dia: o dia precisa estar no expediente, e saem os
// ocupados e, se for hoje, os que já passaram.
// ocupadosPorData tem o formato { '2026-10-26': ['10:00', '14:00'] }.
function horariosDisponiveis(dia, agora, expediente, ocupadosPorData) {
  if (!(expediente.diasFuncionamento || []).includes(dia.getDay())) return [];
  const chave = chaveData(dia);
  const ocupados = ocupadosPorData[chave] || [];
  return horariosLivres(gerarHorarios(expediente), ocupados, chave, agora);
}

// Um dia pode ser escolhido se não passou e tem horário livre
function diaDisponivel(dia, agora, expediente, ocupadosPorData) {
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  if (dia < inicioHoje) return false;
  return horariosDisponiveis(dia, agora, expediente, ocupadosPorData).length > 0;
}

function primeiroDiaDisponivel(agora, expediente, ocupadosPorData) {
  for (let i = 0; i < 60; i++) {
    const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + i);
    if (diaDisponivel(d, agora, expediente, ocupadosPorData)) return d;
  }
  return null;
}

// Props:
//   servico    -> { id, nome } do serviço escolhido na tela anterior
//   onVoltar   -> volta para a tela anterior
//   onAgendado -> chamado depois que o servidor confirmou: ({ data, dataTexto, hora })
export default function SelecionarDataHoraScreen({
  servico,
  onVoltar = () => {},
  onAgendado = () => {},
}) {
  const agora = useMemo(() => new Date(), []);

  const [expediente, setExpediente] = useState(null);
  const [ocupadosPorData, setOcupadosPorData] = useState({});
  const [erro, setErro] = useState('');
  const [carregandoMes, setCarregandoMes] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [hora, setHora] = useState(null);
  const [mesVisivel, setMesVisivel] = useState({
    ano: agora.getFullYear(),
    mes: agora.getMonth(),
  });
  const [modalAberto, setModalAberto] = useState(false);

  // Garante que o dia inicial é escolhido só uma vez, na primeira carga.
  const selecaoInicialFeita = useRef(false);

  const { ano, mes } = mesVisivel;

  // 1) Quando a tela abre, busca o expediente no Firestore.
  useEffect(() => {
    async function carregarExpediente() {
      try {
        setExpediente(await buscarExpediente());
      } catch (e) {
        setErro(mensagemDeErroAgendamento(e.code));
      }
    }
    carregarExpediente();
  }, []);

  // 2) Busca os horários ocupados do mês e guarda em ocupadosPorData.
  async function carregarMes(exp, anoMes, mesMes) {
    setCarregandoMes(true);
    try {
      const novos = await buscarOcupadosDoMes(exp.barbeiroId, anoMes, mesMes);
      const prefixo = `${anoMes}-${doisDigitos(mesMes + 1)}`;
      setOcupadosPorData((anterior) => {
        const resto = {};
        Object.keys(anterior).forEach((chave) => {
          if (!chave.startsWith(prefixo)) resto[chave] = anterior[chave];
        });
        return { ...resto, ...novos };
      });

      // Na primeira carga, já deixa o primeiro dia livre selecionado.
      if (!selecaoInicialFeita.current) {
        selecaoInicialFeita.current = true;
        const primeiro = primeiroDiaDisponivel(agora, exp, novos);
        setDiaSelecionado(primeiro);
        setHora(
          primeiro ? horariosDisponiveis(primeiro, agora, exp, novos)[0] ?? null : null
        );
      }
      return novos;
    } catch (e) {
      Alert.alert('Não foi possível carregar os horários', mensagemDeErroAgendamento(e.code));
      return null;
    } finally {
      setCarregandoMes(false);
    }
  }

  // Roda quando o expediente chega e sempre que o mês visível muda.
  useEffect(() => {
    if (!expediente) return;
    carregarMes(expediente, ano, mes);
  }, [expediente, ano, mes]);

  // ----- Calendário: monta as células do mês (vazias no início + dias do mês) -----
  const celulas = useMemo(() => {
    const deslocamento = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    return [
      ...Array(deslocamento).fill(null),
      ...Array.from({ length: totalDias }, (_, i) => new Date(ano, mes, i + 1)),
    ];
  }, [ano, mes]);

  const diferencaMeses = (ano - agora.getFullYear()) * 12 + (mes - agora.getMonth());
  const podeVoltarMes = diferencaMeses > 0;
  const podeAvancarMes = diferencaMeses < MESES_A_FRENTE;

  const mudarMes = (delta) => {
    const d = new Date(ano, mes + delta, 1);
    setMesVisivel({ ano: d.getFullYear(), mes: d.getMonth() });
  };

  // Enquanto o expediente não chega, mostra "carregando" (ou o erro).
  if (erro) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erroTexto}>{erro}</Text>
        <TouchableOpacity onPress={onVoltar}>
          <Text style={styles.voltar}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!expediente) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.branco} />
      </View>
    );
  }

  const horariosDoDia = diaSelecionado
    ? horariosDisponiveis(diaSelecionado, agora, expediente, ocupadosPorData)
    : [];

  const escolherDia = (dia) => {
    setDiaSelecionado(dia);
    const livres = horariosDisponiveis(dia, agora, expediente, ocupadosPorData);
    setHora(livres[0] || null); // sugere o primeiro horário livre
  };

  const agendar = async () => {
    if (!diaSelecionado || !hora || salvando) return;
    setSalvando(true);
    try {
      await criarAgendamento({
        servico,
        data: chaveData(diaSelecionado),
        horaInicio: hora,
        barbeiroId: expediente.barbeiroId,
      });
      // Só chega aqui depois que o servidor confirmou.
      onAgendado({
        data: chaveData(diaSelecionado),
        dataTexto: textoData(diaSelecionado),
        hora,
      });
    } catch (e) {
      Alert.alert('Não foi possível agendar', mensagemDeErroAgendamento(e.code));
      if (e.code === 'horario-ocupado') {
        // Outra pessoa pegou o horário: atualiza a lista e sugere outro.
        const novos = await carregarMes(
          expediente,
          diaSelecionado.getFullYear(),
          diaSelecionado.getMonth()
        );
        if (novos) {
          const livres = horariosDisponiveis(diaSelecionado, agora, expediente, novos);
          setHora(livres[0] ?? null);
        }
      }
    } finally {
      setSalvando(false);
    }
  };

  const podeAgendar = !!diaSelecionado && !!hora && !salvando;

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/LOGO.png')}
        style={styles.logo}
        resizeMode="cover"
      />

      {/* Cartão do calendário */}
      <View style={styles.cartao}>
        <View style={styles.cabecalhoMes}>
          <Text style={styles.tituloMes}>
            {NOMES_MES[mes]} {ano}
          </Text>
          {carregandoMes && <ActivityIndicator size="small" color={cores.azul} />}
          <View style={styles.setas}>
            <TouchableOpacity disabled={!podeVoltarMes} onPress={() => mudarMes(-1)}>
              <Text style={[styles.seta, !podeVoltarMes && styles.setaDesativada]}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={!podeAvancarMes} onPress={() => mudarMes(1)}>
              <Text style={[styles.seta, !podeAvancarMes && styles.setaDesativada]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.linha}>
          {DIAS_SEMANA.map((nome) => (
            <Text key={nome} style={styles.diaSemana}>
              {nome}
            </Text>
          ))}
        </View>

        <View style={styles.linha}>
          {celulas.map((dia, i) => {
            if (!dia) return <View key={`vazio-${i}`} style={styles.celula} />;
            const disponivel =
              !carregandoMes && diaDisponivel(dia, agora, expediente, ocupadosPorData);
            const ativo = diaSelecionado && mesmoDia(dia, diaSelecionado);
            return (
              <TouchableOpacity
                key={chaveData(dia)}
                style={styles.celula}
                disabled={!disponivel}
                onPress={() => escolherDia(dia)}
              >
                <View style={[styles.bolinha, ativo && styles.bolinhaAtiva]}>
                  <Text
                    style={[
                      styles.numeroDia,
                      !disponivel && styles.numeroDesativado,
                      ativo && styles.numeroAtivo,
                    ]}
                  >
                    {dia.getDate()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Linha Horas */}
        <View style={styles.linhaHoras}>
          <Text style={styles.rotuloHoras}>Horas</Text>
          <TouchableOpacity
            style={styles.chipHora}
            disabled={horariosDoDia.length === 0}
            onPress={() => setModalAberto(true)}
          >
            <Text style={styles.chipHoraTexto}>
              {hora || (horariosDoDia.length > 0 ? 'Escolher' : 'Sem horários')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.botao, !podeAgendar && styles.botaoDesativado]}
        disabled={!podeAgendar}
        onPress={agendar}
      >
        <Text style={styles.botaoTexto}>{salvando ? 'Aguarde...' : 'Agendar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onVoltar}>
        <Text style={styles.voltar}>Voltar</Text>
      </TouchableOpacity>

      {/* Lista de horários do dia escolhido */}
      <Modal
        visible={modalAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAberto(false)}
      >
        <TouchableOpacity
          style={styles.modalFundo}
          activeOpacity={1}
          onPress={() => setModalAberto(false)}
        >
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>Escolha o horário</Text>
            <FlatList
              data={horariosDoDia}
              keyExtractor={(h) => h}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, item === hora && styles.modalItemAtivo]}
                  onPress={() => {
                    setHora(item);
                    setModalAberto(false);
                  }}
                >
                  <Text style={[styles.modalItemTexto, item === hora && styles.modalItemTextoAtivo]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    paddingTop: 50,
  },
  centro: {
    flex: 1,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  erroTexto: { color: cores.branco, fontSize: 16, textAlign: 'center' },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F2EDE0',
    marginBottom: 40,
  },
  cartao: {
    width: '88%',
    backgroundColor: cores.cartao,
    borderRadius: 16,
    padding: 14,
  },
  cabecalhoMes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tituloMes: { fontSize: 15, fontWeight: 'bold', color: cores.texto },
  setas: { flexDirection: 'row' },
  seta: { fontSize: 26, color: cores.azul, paddingHorizontal: 12 },
  setaDesativada: { color: '#C9C9C9' },
  linha: { flexDirection: 'row', flexWrap: 'wrap' },
  diaSemana: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 10,
    color: cores.textoSuave,
    marginBottom: 6,
  },
  celula: {
    width: `${100 / 7}%`,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bolinha: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bolinhaAtiva: { backgroundColor: cores.azulClaro },
  numeroDia: { fontSize: 16, color: cores.texto },
  numeroDesativado: { color: '#BBBBBB' },
  numeroAtivo: { color: cores.azul, fontWeight: 'bold' },
  linhaHoras: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    marginTop: 10,
    paddingTop: 12,
  },
  rotuloHoras: { fontSize: 14, color: cores.texto },
  chipHora: {
    backgroundColor: '#E3E3E3',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipHoraTexto: { fontSize: 15, color: cores.texto },
  botao: {
    marginTop: 40,
    backgroundColor: cores.vinho,
    borderWidth: 1,
    borderColor: cores.vinhoBorda,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 50,
  },
  botaoDesativado: { opacity: 0.4 },
  botaoTexto: { color: cores.branco, fontSize: 18 },
  voltar: {
    marginTop: 18,
    color: cores.branco,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCaixa: {
    width: '70%',
    maxHeight: '60%',
    backgroundColor: cores.cartao,
    borderRadius: 16,
    padding: 16,
  },
  modalTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: cores.texto },
  modalItem: { paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  modalItemAtivo: { backgroundColor: cores.azulClaro },
  modalItemTexto: { fontSize: 16, color: cores.texto },
  modalItemTextoAtivo: { color: cores.azul, fontWeight: 'bold' },
});