import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';

function criarErro(codigo) {
  const erro = new Error(codigo);
  erro.code = codigo;
  return erro;
}

// Lê o expediente e o barbeiro responsável (documento configuracao/expediente).
export async function buscarExpediente() {
  const resposta = await getDoc(doc(db, 'configuracao', 'expediente'));
  if (!resposta.exists()) throw criarErro('expediente-nao-encontrado');
  return resposta.data();
}

async function horariosOcupadosAtivos(documentos) {
  return Promise.all(
    documentos.map(async (documento) => {
      const agendamento = await getDoc(doc(db, 'appointments', documento.id));
      return !agendamento.exists() || agendamento.data().status !== 'cancelado';
    })
  );
}

// Horários já ocupados em uma data. Devolve só as horas, sem dados pessoais.
export async function buscarHorariosOcupados(barbeiroId, data) {
  const consulta = query(
    collection(db, 'ocupados'),
    where('barbeiroId', '==', barbeiroId),
    where('data', '==', data)
  );
  const resposta = await getDocs(consulta);
  const ativos = await horariosOcupadosAtivos(resposta.docs);
  return resposta.docs
    .filter((_, indice) => ativos[indice])
    .map((documento) => documento.data().horaInicio);
}

// Horários ocupados de um mês inteiro, agrupados por data.
// mes vai de 0 a 11 (como no JavaScript). Devolve algo como:
// { '2026-10-26': ['10:00', '14:00'] }
// A consulta usa só o campo data, então não precisa criar índice no Firestore.
export async function buscarOcupadosDoMes(barbeiroId, ano, mes) {
  const prefixo = `${ano}-${String(mes + 1).padStart(2, '0')}`;
  const consulta = query(
    collection(db, 'ocupados'),
    where('data', '>=', `${prefixo}-01`),
    where('data', '<=', `${prefixo}-31`)
  );
  const resposta = await getDocs(consulta);
  const documentos = resposta.docs.filter(
    (documento) => documento.data().barbeiroId === barbeiroId
  );
  const ativos = await horariosOcupadosAtivos(documentos);
  const porData = {};
  documentos.forEach((documento, indice) => {
    if (!ativos[indice]) return;
    const item = documento.data();
    if (!porData[item.data]) porData[item.data] = [];
    porData[item.data].push(item.horaInicio);
  });
  return porData;
}

// Salva o agendamento. Só termina com sucesso depois que o servidor confirma.
export async function criarAgendamento({ servico, data, horaInicio, barbeiroId }) {
  const usuario = auth.currentUser;
  if (!usuario) throw criarErro('nao-logado');
  if (!servico?.id || !servico?.nome) throw criarErro('servico-invalido');

  // O mesmo ID nos dois documentos impede dois agendamentos no mesmo horário.
  const idHorario = `${barbeiroId}_${data}_${horaInicio.replace(':', '')}`;
  const refOcupado = doc(db, 'ocupados', idHorario);
  const refAgendamento = doc(db, 'appointments', idHorario);
  const dadosAgendamento = {
    userId: usuario.uid,
    barbeiroId,
    serviceId: servico.id,
    servicoNome: servico.nome,
    servicoPreco: Number(servico.preco) || 0,
    data,
    horaInicio,
    status: 'confirmado',
    criadoEm: serverTimestamp(),
  };

  await runTransaction(db, async (transacao) => {
    const ocupado = await transacao.get(refOcupado);
    const agendamento = await transacao.get(refAgendamento);

    if (agendamento.exists()) {
      if (agendamento.data().status !== 'cancelado') {
        throw criarErro('horario-ocupado');
      }

      transacao.update(refAgendamento, dadosAgendamento);
      if (!ocupado.exists()) {
        transacao.set(refOcupado, { barbeiroId, data, horaInicio });
      }
      return;
    }

    if (ocupado.exists()) throw criarErro('horario-ocupado');

    transacao.set(refOcupado, { barbeiroId, data, horaInicio });
    transacao.set(refAgendamento, dadosAgendamento);
  });

  return idHorario;
}

// Mensagens em português para cada tipo de erro.
export function mensagemDeErroAgendamento(codigo) {
  switch (codigo) {
    case 'horario-ocupado':
      return 'Esse horário acabou de ser ocupado. Escolha outro.';
    case 'nao-logado':
      return 'Faça login para agendar.';
    case 'servico-invalido':
      return 'Volte e escolha um serviço antes de agendar.';
    case 'expediente-nao-encontrado':
      return 'Os horários ainda não foram configurados.';
    case 'permission-denied':
      return 'Sem permissão para agendar. Avise a equipe.';
    case 'unavailable':
    case 'failed-precondition':
      return 'Sem conexão com a internet. Tente novamente.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
}