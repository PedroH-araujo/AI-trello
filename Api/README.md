# Chatbot Trello em Português

Um chatbot em Node.js que usa LangChain para interagir com a API do Trello, permitindo que usuários criem quadros, listas e cartões através de comandos em linguagem natural em português.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
Crie um arquivo `.env` com suas credenciais da API do Trello e OpenAI:
```
TRELLO_API_KEY=your_api_key_here
TRELLO_TOKEN=your_token_here
OPENAI_API_KEY=your_api_key_here
```

Para obter suas credenciais:
- Trello: Visite https://trello.com/app-key
- OpenAI: Visite https://platform.openai.com/api-keys

3. Execute o chatbot:
```bash
npm start
```

## Comandos Disponíveis

O chatbot entende várias formas naturais de solicitar ações, por exemplo:

### Criar Quadro
- "Preciso de um quadro para meu projeto"
- "Cria um quadro chamado Tarefas"
- "Faz um quadro pra mim organizar o trabalho"

### Criar Lista
- "Quero criar uma lista no quadro"
- "Adiciona uma lista de tarefas"
- "Preciso de uma lista nova"

### Criar Cartão
- "Cria um cartão na lista"
- "Adiciona uma tarefa"
- "Preciso criar um cartão novo"

### Listar Quadros
- "Quais quadros eu tenho?"
- "Mostra meus quadros"
- "Lista meus quadros"

### Listar Listas
- "Mostrar listas do quadro"
- "Ver listas do quadro"
- "Lista as listas"

### Listar Cartões
- "Quais cartões tem na lista?"
- "Mostra os cartões"
- "Lista os cartões"

### Mover Cartão
- "Move o cartão para a lista"
- "Muda o cartão de lista"
- "Muda o cartão para a lista de tarefas"

### Ajuda
- "O que você pode fazer?"
- "Como você pode me ajudar?"
- "Quais comandos você entende?"

## Tratamento de Erros

O chatbot inclui tratamento de erros para requisições à API e fornece feedback em português sobre o sucesso ou falha das operações.
