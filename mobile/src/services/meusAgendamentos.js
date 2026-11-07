import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Prazo mínimo para cancelar, em horas antes do atendimento
const ANTECEDENCIA_MIN_HORAS = 24;

// Transforma data '2026-11-12' e hora '09:00' em um objeto Date
function inicioDe(agendamento) {
  const [a, m, d] = String(agendamento.data).split('-').map(Number);
  const [h, min] = String(agendamento.horaInicio).split(':').map(Number);
  return new Date(a, m - 1, d, h, min);
}

// Ainda dá tempo de cancelar? (falta mais do que o prazo mínimo)
export function podeCancelar(agendamento) {
  const limite = new Date(
    inicioDe(agendamento).getTime() - ANTECEDENCIA_MIN_HORAS * 60 * 60 * 1000
  );
  return new Date() <= limite;
}

// Agendamentos futuros do cliente logado, em tempo real
export function ouvirMeusAgendamentos(aoMudar, aoErrar) {
  const usuario = auth.currentUser;
  if (!usuario) {
    aoMudar([]);
    return () => {};
  }
  const consulta = query(collection(db, 'appointments'), where('userId', '==', usuario.uid));
  return onSnapshot(
    consulta,
    (snap) => {
      const agora = new Date();
      const lista = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((a) => a.status !== 'cancelado' && inicioDe(a) > agora)
        .sort((a, b) => inicioDe(a) - inicioDe(b));
      aoMudar(lista);
    },
    aoErrar
  );
}

// Cancela, se ainda estiver dentro do prazo
export async function cancelarAgendamento(agendamento) {
  if (!podeCancelar(agendamento)) throw new Error('PRAZO_CANCELAMENTO');
  await updateDoc(doc(db, 'appointments', agendamento.id), { status: 'cancelado' });
}