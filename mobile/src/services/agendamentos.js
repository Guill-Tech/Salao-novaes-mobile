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

// Horários já ocupados em uma data. Devolve só as horas, sem dados pessoais.
export async function buscarHorariosOcupados(barbeiroId, data) {
  const consulta = query(
    collection(db, 'ocupados'),
    where('barbeiroId', '==', barbeiroId),
    where('data', '==', data)
  );
  const resposta = await getDocs(consulta);
  return resposta.docs.map((documento) => documento.data().horaInicio);
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
  const porData = {};
  resposta.docs.forEach((documento) => {
    const item = documento.data();
    if (item.barbeiroId !== barbeiroId) return;
    if (!porData[item.data]) porData[item.data] = [];
    porData[item.data].push(item.horaInicio);
  });
  return porData;
}

// Salva o agendamento. Só termina com sucesso depois que o servidor confirma.
export async function criarAgendamento({ servico, data, horaInicio, barbeiroId }) {
  const usuario = auth.currentUser;
  if (!usuario) throw criarErro('nao-logado');

  // O mesmo ID nos dois documentos impede dois agendamentos no mesmo horário.
  const idHorario = `${barbeiroId}_${data}_${horaInicio.replace(':', '')}`;
  const refOcupado = doc(db, 'ocupados', idHorario);
  const refAgendamento = doc(db, 'appointments', idHorario);

  await runTransaction(db, async (transacao) => {
    const ocupado = await transacao.get(refOcupado);
    if (ocupado.exists()) throw criarErro('horario-ocupado');

    transacao.set(refOcupado, { barbeiroId, data, horaInicio });
    transacao.set(refAgendamento, {
      userId: usuario.uid,
      barbeiroId,
      serviceId: servico.id,
      data,
      horaInicio,
      status: 'confirmado',
      criadoEm: serverTimestamp(),
    });
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