Task Manager SENAC

Esta aplicação web foi desenvolvida para organizar tarefas do dia a dia, trabalhos acadêmicos e projetos pessoais. Trata-se de uma Single Page Application (SPA) construída com HTML5 e Tailwind CSS, integrada diretamente ao Firebase (v10 SDK Modular) para autenticação de usuários e armazenamento de dados em tempo real, eliminando a necessidade de um servidor Node.js dedicado.

Sobre o Projeto

O objetivo do Task Manager é oferecer uma interface rápida, limpa e funcional para a gestão de prazos e entregas. O sistema permite criar tarefas, definir horários, associar datas limite, atribuir prioridades e organizar as entradas por etiquetas coloridas. A integração com o Cloud Firestore garante a sincronização dos dados em tempo real, permitindo acessar a lista atualizada a partir de qualquer dispositivo autenticado na mesma conta.

Funcionalidades

Sistema de Autenticação:

Registro e login com e-mail e senha através do Firebase Auth.

Botão de alternância de visibilidade da senha (ícone de olho).

Funcionalidade de envio de e-mail para redefinição de senha ("Esqueci-me da palavra-passe").

Validação para evitar a criação de contas duplicadas ("Este e-mail já está em uso por outro usuário").

Manutenção de sessão ativa e funcionalidade de encerramento de sessão (Logout).

Gestão de Tarefas (CRUD):

Parâmetros: Título/nome da tarefa, data, horário, nível de prioridade (Baixa, Média, Alta) e cor da etiqueta (Roxo, Verde, Amarelo, Vermelho, Azul).

Sincronização em Tempo Real: Atualizações instantâneas na interface através do listener onSnapshot do Firestore.

Estado e Remoção: Alternância simples entre os estados pendente e concluído, e opção de remoção permanente.

Alerta de Tarefa Duplicada:

Na tentativa de criar uma tarefa pendente com o mesmo nome de outra existente, o sistema exibe um aviso em amarelo, permitindo, ainda assim, concluir o salvamento com um segundo clique (útil para tarefas recorrentes).

Filtros e Contadores:

Abas no topo para filtragem rápida entre Todas, Pendentes e Concluídas.

Apresentação da contagem exata de tarefas em cada categoria.

Interface Responsiva:

Layout em modo escuro estilizado com Tailwind CSS e ícones do Font Awesome.

Evidências de Funcionamento

Abaixo estão apresentadas as capturas de tela demonstrando a aplicação em execução e a integração com os serviços do Firebase:

1. Tela de Login e Redefinição de Senha

Interface de entrada na conta com validações, botão para exibir/ocultar senha e funcionalidade de recuperação de acesso.

2. Tela de Cadastro de Usuário

Formulário de criação de nova conta com validação de credenciais via Firebase Authentication.

3. Painel Principal (Estado Vazio)

Dashboard carregado imediatamente após o login do usuário, exibindo as estatísticas zeradas e o aviso de nenhuma tarefa cadastrada.

4. Modal de Criação de Tarefa

Interface para inclusão de novas tarefas com parâmetros de data, hora, prioridade e seleção de cor da etiqueta.

5. Listagem e Gestão de Tarefas (CRUD em Tempo Real)

Painel exibindo tarefas cadastradas dinamicamente com bordas coloridas indicativas, marcas de prioridade e controles de conclusão e remoção.

6. Configuração no Console do Firebase

Evidência do provedor de autenticação por E-mail/Senha ativado no painel Authentication do projeto TASK SENAC.

Como Executar Localmente

Não é necessária a instalação de dependências complexas ou ambientes de execução adicionais, uma vez que a aplicação é executada diretamente no navegador consumindo os SDKs do Firebase via CDN.

Pré-requisitos:

Um navegador web moderno (Chrome, Edge, Firefox, etc.).

O editor VS Code com a extensão Live Server (ou Python instalado no sistema).

Passo a Passo:

Salvamento do Arquivo:

Salvar o código final no arquivo index.html dentro de uma pasta local.

Execução via Live Server (VS Code):

Abrir a pasta no VS Code.

Clicar com o botão direito no arquivo index.html e selecionar Open with Live Server.

A aplicação ficará acessível no endereço http://127.0.0.1:5500.

Execução via Terminal (Python):


Abrir o terminal na pasta do projeto e executar:

python -m http.server 8000


Acessar http://localhost:8000 no navegador.

Configuração de Regras no Firebase:

Garantir que as regras do Firestore Database no console do Firebase autorizam a leitura e escrita a usuários autenticados:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
