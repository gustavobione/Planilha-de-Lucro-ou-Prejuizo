📊 Planilha de Lucro e Prejuízo - Mary Kay
📖 Descrição
Esta é uma aplicação web desenvolvida para ajudar consultoras de beleza Mary Kay a gerenciar suas finanças de forma simples e eficiente. A ferramenta permite o registro de todas as transações de compra e venda de produtos, calculando automaticamente o lucro ou prejuízo e fornecendo um painel visual com os resultados financeiros.

O projeto foi criado para ser uma alternativa digital e inteligente às planilhas tradicionais, oferecendo persistência de dados na nuvem, segurança com contas de usuário individuais e uma interface amigável.

Este projeto foi desenvolvido com o auxílio da IA Gemini do Google, que colaborou na estruturação do código, na implementação da lógica de negócios e na depuração de erros.

✨ Funcionalidades
🔐 Autenticação de Usuários: Sistema completo de registro e login com e-mail e senha, garantindo que os dados de cada consultora sejam privados e seguros.

📝 Registro de Transações: Formulário intuitivo para adicionar compras de produtos (custo) e vendas para clientes (receita).

📈 Cálculos em Tempo Real: A aplicação calcula automaticamente o custo total, a receita total e o lucro/prejuízo de cada transação.

📊 Painel Financeiro: Um dashboard visual que resume a saúde financeira do negócio, mostrando a receita total, o custo dos produtos vendidos e o lucro líquido.

☁️ Persistência de Dados na Nuvem: Todas as informações são salvas em tempo real no Firebase, permitindo que a usuária acesse sua conta de qualquer dispositivo.

🔄 Tabela de Histórico: Todas as transações são listadas em uma tabela organizada, com a opção de excluir registros.

📄 Exportação para CSV: Funcionalidade para exportar todos os dados para um arquivo .csv, compatível com Google Sheets, Excel e outros softwares de planilha.

🚀 Tecnologias Utilizadas
Frontend:

HTML5: Estrutura semântica da aplicação.

CSS3: Estilização customizada.

Tailwind CSS: Framework CSS para uma estilização rápida e responsiva.

JavaScript (ES6+): Lógica principal da aplicação, manipulação do DOM e interatividade.

Backend & Banco de Dados (BaaS):

Firebase: Plataforma do Google utilizada para:

Firebase Authentication: Gerenciamento de login e registro de usuários com e-mail e senha.

Firestore Database: Banco de dados NoSQL para armazenar as transações de forma segura e em tempo real.

Ferramentas de Desenvolvimento:

Gemini (IA do Google): Assistente de desenvolvimento para geração de código, refatoração e solução de problemas.

Live Server (Extensão VS Code): Para executar o projeto em um ambiente de desenvolvimento local.

⚙️ Como Executar o Projeto Localmente
Para executar esta aplicação em seu próprio computador, siga os passos abaixo.

Pré-requisitos
Um navegador web moderno (Chrome, Firefox, etc.).

Um editor de código como o VS Code.

Uma conta Google para criar o projeto no Firebase.

Passos
Clone o Repositório

git clone https://github.com/seu-usuario/nome-do-repositorio.git
cd nome-do-repositorio

Crie e Configure um Projeto no Firebase

Siga o guia detalhado para criar um projeto no Firebase, ativar a Authentication (com provedor "E-mail/senha") e o Firestore Database (em modo de teste ou com as regras de segurança fornecidas).

Ao final do processo, copie o objeto de configuração firebaseConfig.

Adicione suas Chaves do Firebase

Abra o arquivo firebase-service.js.

Substitua o objeto firebaseConfig existente pelo objeto que você copiou do seu projeto Firebase.

Atualize as Regras de Segurança do Firestore

No console do seu projeto Firebase, vá para Firestore Database > Regras.

Cole as seguintes regras para garantir que cada usuário só acesse seus próprios dados:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{documents=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

Clique em Publicar.

Execute a Aplicação

Se você usa o VS Code, clique com o botão direito no arquivo index.html e selecione "Open with Live Server".

A aplicação abrirá no seu navegador padrão.

📂 Estrutura do Projeto
.
├── 📄 index.html         # A estrutura principal da aplicação (telas de auth e app)
├── 📄 styles.css         # Estilos CSS customizados
├── 📄 index.js           # Lógica principal da interface e manipulação de eventos
├── 📄 firebase-service.js  # Centraliza a configuração e comunicação com o Firebase
└── 📄 README.md          # Este arquivo

🤝 Contribuição
Contribuições são bem-vindas! Se você tiver ideias para novas funcionalidades ou encontrar um bug, sinta-se à vontade para abrir uma issue ou enviar um pull request.

Faça um fork do projeto.

Crie uma nova branch (git checkout -b feature/nova-funcionalidade).

Faça o commit das suas alterações (git commit -m 'Adiciona nova funcionalidade').

Faça o push para a branch (git push origin feature/nova-funcionalidade).

Abra um Pull Request.

📜 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.