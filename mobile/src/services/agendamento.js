import {
  buscarExpediente,
  criarAgendamento as criarAgendamentoComExpediente,
  mensagemDeErroAgendamento,
} from './agendamentos';

export async function criarAgendamento({ data, hora, serviceId, serviceNome }) {
  const expediente = await buscarExpediente();

  return criarAgendamentoComExpediente({
    servico: { id: serviceId, nome: serviceNome },
    data,
    horaInicio: hora,
    barbeiroId: expediente.barbeiroId,
  });
}

export function mensagemDeErro(erro) {
  const codigo = erro?.code || erro?.message;
  const titulos = {
    'horario-ocupado': 'Horário indisponível',
    'nao-logado': 'Faça login',
    'servico-invalido': 'Escolha um serviço',
    'expediente-nao-encontrado': 'Horários indisponíveis',
  };

  return {
    titulo: titulos[codigo] || 'Não foi possível agendar',
    texto: mensagemDeErroAgendamento(codigo),
  };
}
