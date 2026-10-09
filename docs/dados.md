# Estrutura inicial dos dados (Firebase)

O aplicativo usa o **Firebase Authentication** para login e cadastro e o
**Cloud Firestore** (banco NoSQL) para guardar os dados. No Firestore, as
informações ficam em **coleções**, e cada coleção tem **documentos** com campos.

## Coleções

### users
Dados do cliente. O ID do documento é o `uid` gerado pelo Authentication.

| Campo | Tipo | Descrição |
|---|---|---|
| nome | texto | Nome do cliente |
| email | texto | E-mail de login |
| telefone | texto | Número com DDD |
| criadoEm | data | Data do cadastro |

A senha não é guardada no Firestore. Quem cuida dela é o Authentication.

### services
Serviços oferecidos pela barbearia.

| Campo | Tipo | Descrição |
|---|---|---|
| nome | texto | Nome do serviço |
| descricao | texto | Detalhes do serviço |
| preco | número | Valor em reais |
| ativo | verdadeiro/falso | Se está disponível |

**Serviços iniciais (a cadastrar no Firestore):**

| Nome | Preço (R$) |
|---|---|
| Corte social | 25,00 |
| Corte degradê | 30,00 |
| Barba | 20,00 |
| Corte + barba | 50,00 |

### appointments
Agendamentos feitos pelos clientes.

| Campo | Tipo | Descrição |
|---|---|---|
| userId | texto | ID do cliente (`uid`) |
| serviceId | texto | ID do serviço escolhido |
| data | texto | Data no formato aaaa-mm-dd |
| horaInicio | texto | Horário no formato HH:mm |
| status | texto | confirmado, cancelado ou concluído |
| criadoEm | data | Quando foi agendado |

## Relações entre as coleções

- Um cliente (`users`) pode ter vários agendamentos (`appointments`).
- Cada agendamento aponta para um serviço (`services`) pelo ID.

## Observações

- Os horários disponíveis não têm coleção própria nesta etapa. O app gera os
  horários em intervalos fixos e remove os que já têm agendamento na data.
- Esta estrutura é inicial e pode ser ajustada nas próximas sprints.