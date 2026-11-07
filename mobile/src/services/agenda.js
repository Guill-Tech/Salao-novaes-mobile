import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Guarda nomes já buscados, para não consultar o mesmo cliente várias vezes
const cacheNomes = {};

async function nomeDe(colecao, id, campo) {
  if (!id) return '';
  const chave = `${colecao}/${id}`;
  if (cacheNomes[chave]) return cacheNomes[chave];
  try {
    const snap = await getDoc(doc(db, colecao, id));
    const nome = snap.exists() ? snap.data()[campo] || '' : '';
    cacheNomes[chave] = nome;
    return nome;
  } catch (erro) {
    return '';
  }
}

// Completa o agendamento com o nome do cliente (userId) e do serviço (serviceId)
async function completar(docSnap) {
  const dados = { id: docSnap.id, ...docSnap.data() };
  const cliente = await nomeDe('users', dados.userId, 'nome');
  const servico = dados.servicoNome || (await nomeDe('services', dados.serviceId, 'nome'));
  return {
    ...dados,
    clienteNome: cliente || 'Cliente',
    servicoNome: servico || 'Serviço',
  };
}

// Ordena por data e depois por horário (feito aqui para não exigir índice no Firestore)
function ordenar(lista) {
  return lista.sort((a, b) => {
    const porData = String(a.data).localeCompare(String(b.data));
    return porData !== 0 ? porData : String(a.horaInicio).localeCompare(String(b.horaInicio));
  });
}

// Escuta, em tempo real, os agendamentos de um dia (dataChave = 'AAAA-MM-DD')
export function ouvirAgendamentosDoDia(dataChave, aoMudar, aoErrar) {
  const consulta = query(collection(db, 'appointments'), where('data', '==', dataChave));
  return onSnapshot(
    consulta,
    async (snap) => {
      const lista = await Promise.all(snap.docs.map(completar));
      aoMudar(ordenar(lista.filter((a) => a.status !== 'cancelado')));
    },
    aoErrar
  );
}

// Escuta os agendamentos de hoje em diante
export function ouvirProximosAgendamentos(hojeChave, aoMudar, aoErrar) {
  const consulta = query(collection(db, 'appointments'), where('data', '>=', hojeChave));
  return onSnapshot(
    consulta,
    async (snap) => {
      const lista = await Promise.all(snap.docs.map(completar));
      aoMudar(ordenar(lista.filter((a) => a.status !== 'cancelado')));
    },
    aoErrar
  );
}