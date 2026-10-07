## Salão Novaes

## Sobre o projeto

O Salão Novaes é um projeto de aplicativo mobile desenvolvido para uma barbearia, com o objetivo de facilitar o agendamento de serviços e melhorar a organização do atendimento aos clientes.

## Objetivo

Desenvolver uma solução mobile que permita aos clientes consultar os serviços disponíveis, escolher horários e realizar agendamentos de forma simples e prática.

## Tecnologias previstas

* React Native
* Expo
* JavaScript
* Figma
* Node.js
* Firebase
* Git e GitHub

## Protótipo (Figma)

O design das telas do aplicativo está disponível no Figma:

[Abrir protótipo](https://www.figma.com/design/RgfcFYyYEMnzybNPQ4Ix40/BarbeariaProject)

Mais detalhes em [docs/figma.md](docs/figma.md).

## Planejamento

O desenvolvimento do aplicativo será realizado de forma progressiva ao longo das quatro sprints do projeto, acompanhando as atividades definidas no Kanban.

Inicialmente será utilizada a interface desenvolvida no Figma como referência para a implementação do aplicativo.

## Arquitetura

O aplicativo é desenvolvido em React Native com Expo, que roda sobre o
Node.js. O backend utiliza o Firebase (Authentication para login e
cadastro, e Firestore para serviços, profissionais e agendamentos),
dispensando um servidor próprio nesta etapa.

## Versionamento

O projeto utilizará Git e GitHub para armazenar os arquivos e acompanhar a evolução do desenvolvimento durante as sprints.

As alterações relevantes serão registradas por meio de commits ao longo do desenvolvimento.

## Como rodar o projeto

Pré-requisitos: Node.js (versão LTS), Git e o app Expo Go no celular.

    git clone https://github.com/Guill-Tech/Salao-novaes-mobile.git
    cd Salao-novaes-mobile/mobile
    npm install
    npx expo start

Escaneie o QR code com o Expo Go (celular e computador na mesma rede
Wi-Fi). Se não conectar, use `npx expo start --tunnel`.
