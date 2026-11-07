import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const BARBEIRO_ID = 'JoR74ARkambHBruYeum97rfaYOV2';

// Regras de negócio básicas, conferidas antes de gravar
function validar({ data, hora, serviceNome }) {
  if (!serviceNome) throw new Error('SEM_SERVICO');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora)) {
    throw new Error('DADOS_INVALIDOS');
  }
  const [a, m, d] = data.split('-').map(Number);
  const [h, min] = hora.split(':').map(Number);
  if (new Date(a, m - 1, d, h, min) <= new Date()) throw new Error('HORARIO_PASSADO');
}

// Grava o agendamento. data = '2026-11-12', hora = '09:00'
export async function criarAgendamento({ data, hora, serviceId, serviceNome }) {
  validar({ data, hora, serviceNome });

  const usuario = auth.currentUser;
  if (!usuario) throw new Error('SEM_LOGIN');

  // Mesmo padrão dos agendamentos que já estão no banco: barbeiroId_2026-11-12_0900
  const id = `${BARBEIRO_ID}_${data}_${hora.replace(':', '')}`;
  const ref = doc(db, 'appointments', id);

  await runTransaction(db, async (transacao) => {
    const existente = await transacao.get(ref);
    if (existente.exists() && existente.data().status !== 'cancelado') {
      throw new Error('HORARIO_OCUPADO');
    }
    transacao.set(ref, {
      barbeiroId: BARBEIRO_ID,
      criadoEm: serverTimestamp(),
      data,
      horaInicio: hora,
      serviceId: serviceId || '',
      servicoNome: serviceNome, // nome gravado junto, para a agenda não precisar buscar
      status: 'confirmado',
      userId: usuario.uid,
    });
  });

  return id;
}

// Transforma o erro técnico em uma mensagem clara para o cliente
export function mensagemDeErro(erro) {
  switch (erro.message) {
    case 'HORARIO_OCUPADO':
      return { titulo: 'Horário indisponível', texto: 'Esse horário já foi reservado. Escolha outro.' };
    case 'HORARIO_PASSADO':
      return { titulo: 'Horário inválido', texto: 'Escolha um horário que ainda não passou.' };
    case 'SEM_SERVICO':
      return { titulo: 'Escolha um serviço', texto: 'Volte e selecione o serviço antes de escolher o horário.' };
    case 'DADOS_INVALIDOS':
      return { titulo: 'Dados inválidos', texto: 'Escolha a data e o horário novamente.' };
    case 'SEM_LOGIN':
      return { titulo: 'Faça login', texto: 'Entre na sua conta para agendar.' };
  }
  if (erro.code === 'permission-denied') {
    return { titulo: 'Sem permissão', texto: 'Não foi possível gravar o agendamento. Entre novamente e tente de novo.' };
  }
  if (erro.code === 'unavailable' || erro.code === 'network-request-failed') {
    return { titulo: 'Sem conexão', texto: 'Verifique sua internet e tente novamente.' };
  }
  return { titulo: 'Não foi possível agendar', texto: 'Tente novamente em instantes.' };
}