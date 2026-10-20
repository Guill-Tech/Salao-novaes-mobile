# Estrutura inicial dos dados (Firebase)

O aplicativo usa o **Firebase Authentication** para login e cadastro e o
**Cloud Firestore** (banco NoSQL) para guardar os dados. No Firestore, as
informações ficam em **coleções**, e cada coleção tem **documentos** com campos.

# Configuração do Firebase

Item	Escolha
Projeto	salao-novaes (plano Spark, gratuito)
Autenticação	Firebase Authentication, por e-mail e senha
Banco de dados	Cloud Firestore, edição Standard, banco (default)
Região	southamerica-east1 (São Paulo)
Modo das regras	Produção (tudo bloqueado, exceto o que as regras liberam)

As chaves de configuração do app ficam no arquivo mobile/.env.local, que não é enviado ao GitHub.

## Coleções

### users

Dados de quem usa o aplicativo. O ID do documento é o uid gerado pelo Authentication.

| Campo | Tipo | Descrição |
|---|---|---|
| nome | texto | Nome do cliente |
| email | texto | E-mail de login |
| telefone | texto | Número com DDD |
| criadoEm | data | Data do cadastro |

O cliente é um usuário com tipo igual a cliente. Não existe uma coleção separada para clientes.
O barbeiro é um usuário com tipo igual a barbeiro. Há um único barbeiro, e a conta dele é criada manualmente pela equipe.
A senha não é guardada no Firestore. Quem cuida dela é o Authentication.

### services
Serviços oferecidos pela barbearia.

| Campo | Tipo | Descrição |
|---|---|---|
| nome | texto | Nome do serviço |
| descricao | texto | Detalhes do serviço |
| preco | número | Valor em reais |
| ativo | verdadeiro/falso | Se está disponível |

Serviços cadastrados:

Nome | Preço(R$)
Cortesocial | 25,00
Corte degradê | 30,00
Barba | 20,00
Corte + barba	| 50,00

Os serviços são cadastrados e alterados pelo console do Firebase. O aplicativo apenas lê essa coleção.

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

- Um usuário do tipo cliente pode ter vários agendamentos (userId).
- Cada agendamento aponta para um serviço (serviceId) e para o barbeiro (barbeiroId).

## Regras de segurança (Firestore)

Coleção | Leitura | Escrita
users |O próprio usuário. O barbeiro lê todos. | Cada usuário cria e altera só o próprio perfil. Novos cadastros só podem ser do tipo cliente, e ninguém muda o próprio tipo.
services | Qualquer usuário logado | Bloqueada pelo aplicativo (somente pelo console)
appointments | Regras a definir na etapa do agendamento: o cliente lê só os próprios, e o barbeiro lê a agenda | A definir

Tudo que não está nas regras permanece bloqueado.

## Observações
Os horários disponíveis não têm coleção própria. O aplicativo gera os horários a partir do expediente e remove os que já têm agendamento na data.
O agendamento será gravado por uma transação do Firestore, que confirma que o horário continua livre no momento de gravar.
Esta estrutura é inicial e pode ser ajustada nas próximas sprints.