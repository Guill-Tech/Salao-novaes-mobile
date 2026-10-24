// Funções "puras": não usam o Firebase, então são fáceis de testar.

function paraMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function paraTexto(minutos) {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0');
  const m = String(minutos % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// Todos os horários do expediente.
// Ex.: 09:00 às 11:00, de 30 em 30 → 09:00, 09:30, 10:00, 10:30.
export function gerarHorarios({ horaInicio, horaFim, intervaloMin }) {
  const lista = [];
  const fim = paraMinutos(horaFim);
  for (
    let m = paraMinutos(horaInicio);
    m + intervaloMin <= fim;
    m += intervaloMin
  ) {
    lista.push(paraTexto(m));
  }
  return lista;
}

// A barbearia abre nesse dia? data = 'aaaa-mm-dd'; dias = números de 0 a 6 (0 = domingo).
export function diaDeFuncionamento(data, dias) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return dias.includes(new Date(ano, mes - 1, dia).getDay());
}

// Data de hoje no formato 'aaaa-mm-dd'.
export function dataDeHoje(agora = new Date()) {
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Horários que ainda podem ser escolhidos: tira os ocupados e,
// se a data for hoje, tira os que já passaram.
export function horariosLivres(todos, ocupados, data, agora = new Date()) {
  const ehHoje = data === dataDeHoje(agora);
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  return todos.filter((hora) => {
    if (ocupados.includes(hora)) return false;
    if (ehHoje && paraMinutos(hora) <= minutosAgora) return false;
    return true;
  });
}