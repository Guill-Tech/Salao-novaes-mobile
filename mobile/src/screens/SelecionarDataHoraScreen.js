import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// ===== CONFIGURAÇÃO DO EXPEDIENTE (ajuste quando definirem os horários reais) =====
const HORA_ABERTURA = 9;      // primeiro horário: 09:00
const HORA_FECHAMENTO = 18;   // o último horário começa antes das 18:00
const INTERVALO_MIN = 60;     // duração de cada atendimento, em minutos
const DIAS_FECHADO = [0];     // 0 = domingo, 1 = segunda ... 6 = sábado
const MESES_A_FRENTE = 3;     // até quantos meses à frente dá para navegar
// Horários ocupados (exemplo). Depois virão da coleção appointments do Firestore.
const OCUPADOS_EXEMPLO = ['10:00', '14:00'];

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

// Chave AAAA-MM-DD (usada depois para montar o ID do agendamento)
const chaveData = (d) =>
  `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;

// Texto DD/MM/AAAA (para mostrar ao cliente)
const textoData = (d) =>
  `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()}`;

const mesmoDia = (a, b) => chaveData(a) === chaveData(b);

// Gera os horários do expediente: 09:00, 10:00, 11:00...
function gerarHorarios() {
  const lista = [];
  for (let min = HORA_ABERTURA * 60; min < HORA_FECHAMENTO * 60; min += INTERVALO_MIN) {
    lista.push(`${doisDigitos(Math.floor(min / 60))}:${doisDigitos(min % 60)}`);
  }
  return lista;
}

// Horários livres de um dia: tira os ocupados e, se for hoje, os que já passaram
function horariosDisponiveis(dia, agora) {
  return gerarHorarios().filter((h) => {
    if (OCUPADOS_EXEMPLO.includes(h)) return false;
    if (mesmoDia(dia, agora)) {
      const [hh, mm] = h.split(':').map(Number);
      const slot = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), hh, mm);
      if (slot <= agora) return false;
    }
    return true;
  });
}

// Um dia pode ser escolhido se não passou, não é dia fechado e tem horário livre
function diaDisponivel(dia, agora) {
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  if (dia < inicioHoje) return false;
  if (DIAS_FECHADO.includes(dia.getDay())) return false;
  return horariosDisponiveis(dia, agora).length > 0;
}

function primeiroDiaDisponivel(agora) {
  for (let i = 0; i < 60; i++) {
    const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + i);
    if (diaDisponivel(d, agora)) return d;
  }
  return null;
}

// Props: onVoltar, onAgendar({ data, dataTexto, hora })
export default function SelecionarDataHoraScreen({ onVoltar, onAgendar }) {
  const agora = useMemo(() => new Date(), []);
  const inicial = useMemo(() => primeiroDiaDisponivel(agora), [agora]);

  const [diaSelecionado, setDiaSelecionado] = useState(inicial);
  const [hora, setHora] = useState(inicial ? horariosDisponiveis(inicial, agora)[0] : null);
  const [mesVisivel, setMesVisivel] = useState({
    ano: (inicial || agora).getFullYear(),
    mes: (inicial || agora).getMonth(),
  });
  const [modalAberto, setModalAberto] = useState(false);

  // ----- Calendário: monta as células do mês (vazias no início + dias do mês) -----
  const { ano, mes } = mesVisivel;
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

  const escolherDia = (dia) => {
    setDiaSelecionado(dia);
    setHora(horariosDisponiveis(dia, agora)[0] || null); // sugere o primeiro horário livre
  };

  const horariosDoDia = diaSelecionado ? horariosDisponiveis(diaSelecionado, agora) : [];

  const agendar = () => {
    if (!diaSelecionado || !hora || !onAgendar) return;
    onAgendar({
      data: chaveData(diaSelecionado),
      dataTexto: textoData(diaSelecionado),
      hora,
    });
  };

  const podeAgendar = !!diaSelecionado && !!hora;

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
            const disponivel = diaDisponivel(dia, agora);
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
            <Text style={styles.chipHoraTexto}>{hora || 'Sem horários'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.botao, !podeAgendar && styles.botaoDesativado]}
        disabled={!podeAgendar}
        onPress={agendar}
      >
        <Text style={styles.botaoTexto}>Agendar</Text>
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