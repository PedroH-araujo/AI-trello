export const PROMPT_TEMPLATE = `Você é um assistente que ajuda os usuários a gerenciar seus quadros do Trello.
Você entende solicitações em linguagem natural em português e ajuda a identificar as intenções dos usuários.

Você deve identificar a intenção do usuário e responder naturalmente. As intenções possíveis são:
- criar_quadro: Quando o usuário quer criar um novo quadro/board
- listar_quadros: Quando o usuário quer ver seus quadros/boards
- criar_lista: Quando o usuário quer criar uma lista em um quadro
- listar_listas: Quando o usuário quer ver as listas de um quadro
- criar_cartao: Quando o usuário quer criar um cartão/card em uma lista
- mover_cartao: Quando o usuário quer mover um cartão para outra lista

Responda em português de forma natural, mas inclua a intenção identificada entre colchetes no início da resposta.
Por exemplo: "[criar_quadro] Claro! Vou ajudar você a criar um novo quadro. Qual nome você quer dar a ele?"

Conversa atual:
{history}
Usuário: {input}
Assistente:`;

export const PROMPT_TEMPLATE_RESPONSE = `
Você é um assistente especializado em gerenciar os quadros, listas e cartões do Trello do usuário. Você entende solicitações em linguagem natural em português e é capaz de identificar as intenções e extrair os parâmetros necessários para cada ação. Use as informações disponíveis sobre os quadros, listas e cartões para oferecer respostas claras, precisas e naturais.

As ações possíveis e seus parâmetros obrigatórios são:

create_board: Criação de um novo quadro. Parâmetro necessário: name (nome do quadro).

create_list: Criação de uma nova lista em um quadro. Parâmetros necessários: board_id (ou, se o usuário informar o nome do board, identifique o ID correspondente) e name (nome da lista).

create_card: Criação de um novo cartão em uma lista. Parâmetros necessários: list_id (ou, se o usuário informar o nome da lista, identifique o ID correspondente) e name (nome do cartão).

list_boards: Listagem dos quadros. Nenhum parâmetro obrigatório.

list_lists: Listagem das listas de um quadro. Parâmetro necessário: o nome ou ID do board.

list_cards: Listagem dos cartões de uma lista. Parâmetro necessário: o nome ou ID da lista.

move_card: Movimentação de um cartão para outra lista. Parâmetros necessários: card_id (ou, se o usuário informar o nome do cartão, identifique o ID correspondente) e list_id (ou, se o usuário informar o nome da lista, identifique o ID correspondente).

Instruções adicionais:

Validação dos Parâmetros:
A ação e os parâmetros só devem ser incluídos na resposta quando a ação for de criação (criar quadro, criar lista, criar cartão).

Antes de executar uma ação de criação, verifique se todos os parâmetros obrigatórios foram informados.

Se algum parâmetro estiver ausente (por exemplo, se o usuário disser apenas "criar uma lista" sem indicar em qual board ou qual nome para a lista), responda solicitando a informação faltante.

Nunca escolha um board ou lista de forma arbitrária. Se faltar o board para criar uma lista, pergunte: "Em qual board você quer criar a lista?" ou "Qual board deseja utilizar?"

Se faltar o nome do item (quadro, lista ou cartão), pergunte: "Qual o nome que você deseja?" ou "Por favor, informe o nome."

Formato da Resposta para Ações de Criação:
Quando os parâmetros estiverem completos, responda incluindo a ação e os parâmetros entre colchetes no início da resposta, seguindo o formato:
"[action=nome_da_ação,parâmetro1=valor1,parâmetro2=valor2] Mensagem de confirmação ou resposta."
Por exemplo:
"[action=create_board,name=Novo Projeto] Claro! Vou criar um novo quadro chamado 'Novo Projeto'."

Solicitações Ambíguas:

Se a solicitação for ambígua ou incompleta, peça esclarecimentos antes de executar qualquer ação.

Exemplo: Se o usuário disser "criar lista", responda: "Você quer criar uma lista, mas preciso saber em qual board e qual o nome da lista. Pode informar esses dados?"

Uso dos Dados Disponíveis:

Utilize as informações dos quadros, listas e cartões já existentes para associar nomes com seus respectivos IDs quando o usuário informar um nome.

Se a consulta envolver listagens, apresente apenas os nomes dos itens (quadros, listas, cartões) para facilitar a escolha do usuário.

Converse de forma natural e mantenha a interação fluida, garantindo que todas as informações necessárias sejam confirmadas antes de executar ações de criação.
`;

export const MESSAGES = {
  MOVING_CARD: 'Movendo cartão...',
  CARD_MOVED: '✅ Cartão movido com sucesso!',
  CARD_MOVE_ERROR: '❌ Não foi possível mover o cartão. Tente novamente.',
  CARD_NOT_FOUND: '❌ Cartão não encontrado. Verifique o ID e tente novamente.',
  LISTS_HEADER: '\nListas no quadro:',
  NO_BOARD_SELECTED: '❌ Nenhum quadro selecionado. Escolha um quadro primeiro.',
  WELCOME: 'Chatbot iniciado. Digite suas solicitações (ex: "criar quadro", "criar lista", "criar cartão", "listar quadros")',
  HELP_PROMPT: 'Digite "ajuda" para ver os comandos disponíveis',
  BOARD_PROMPT: 'Qual nome você quer dar ao quadro? ',
  BOARD_LIST_TYPE_PROMPT: 'Você quer criar listas personalizadas ou usar as listas padrão (A fazer, Em andamento, Concluido)?',
  BOARD_CUSTOM_LISTS_PROMPT: 'Digite os nomes das listas separados por vírgula (ex: Backlog, Em Progresso, Concluído):',
  BOARD_DEFAULT_LISTS: ['To Do', 'Doing', 'Done'],
  LIST_PROMPT: 'Em qual quadro você quer criar a lista? (Digite o ID do quadro)',
  CARD_PROMPT: 'Em qual lista você quer criar o cartão? (Digite o ID da lista)',
  CARD_DESC_PROMPT: 'Digite a descrição do cartão:',
  CREATING_BOARD: 'Criando quadro "{name}"...',
  BOARD_CREATED: 'Quadro "{name}" criado com sucesso!',
  BOARD_ID: 'ID do quadro: {id}',
  BOARD_URL: 'URL do quadro: {url}',
  CREATING_LIST: 'Criando lista...',
  LIST_CREATED: 'Lista "{name}" criada com sucesso!',
  LIST_ID: 'ID da lista: {id}',
  CREATING_CARD: 'Criando cartão...',
  CARD_CREATED: 'Cartão "{name}" criado com sucesso!',
  CARD_ID: 'ID do cartão: {id}',
  CARD_URL: 'URL do cartão: {url}',
  FETCHING_BOARDS: 'Buscando seus quadros...',
  NO_BOARDS_FOUND: '❌ Você ainda não tem nenhum quadro. Use "criar quadro" para começar.',
  BOARD_LIST_HEADER: '\nQuadros disponíveis:',
  CHOOSE_BOARD: '\nEscolha o número do quadro ou digite o ID diretamente: ',
  BOARD_LIST_ITEM: '${index + 1}. ${board.name} (ID: ${board.id})',
  BOARD_LIST_EMPTY: 'Você ainda não tem nenhum quadro. Use "criar quadro" para começar.',
  BOARD_LIST_ERROR: '❌ Não foi possível buscar seus quadros. Tente novamente.',
  FETCHING_LISTS: 'Buscando listas do quadro...',
  NO_LISTS_FOUND: '❌ Este quadro não tem listas. Crie uma lista primeiro.',
  LISTS_HEADER: '\nListas disponíveis:',
  LIST_ITEM: '${index + 1}. ${list.name} (ID: ${list.id})',
  CHOOSE_LIST: '\nEscolha o número da lista ou digite o ID diretamente: ',
  CARD_NAME_PROMPT: 'Qual nome você quer dar ao cartão? ',
  CARD_DESC_PROMPT: 'Digite a descrição do cartão: '
};

export const REGEX_PATTERNS = {
  BOARD_LIST_PREFERENCE: [
    /(?:com\s+)?(?:listas?\s+)?(?:padr(?:a|ã)o|default)/i,
    /(?:com\s+)?(?:listas?\s+)?(?:personalizada|customizada|pr(?:o|ó)prias?)/i
  ],
  BOARD_WITH_LISTS: [
    /(?:criar|fazer|adicionar)\s+(?:um\s+)?(?:quadro|board)\s+(?:chamado\s+)?["']?([^"'\s]+(?:\s+[^"'\s]+)*?)["']?\s+(?:com\s+)?(?:listas?\s+)?(?:padr(?:a|ã)o|default|personalizada|customizada)/i,
    /(?:faz|cria|bota)\s+(?:um\s+)?(?:quadro|board)\s+(?:chamado\s+)?["']?([^"'\s]+(?:\s+[^"'\s]+)*?)["']?\s+(?:com\s+)?(?:listas?\s+)?(?:padr(?:a|ã)o|default|personalizada|customizada)/i
  ],
  BOARD_LIST_INTENT: [
    /(?:listar|mostrar|ver|exibir)\s+(?:os\s+)?(?:meus\s+)?(?:quadros|boards|lousas)/i,
    /(?:quais|que)\s+(?:quadros|boards|lousas)\s+(?:eu\s+)?(?:tenho|possuo|existem)/i,
    /(?:me\s+)?(?:mostra|lista|exibe)\s+(?:os\s+)?(?:meus\s+)?(?:quadros|boards|lousas)/i,
    /(?:dá|da)\s+(?:pra|para)\s+(?:ver|mostrar|listar)\s+(?:os\s+)?(?:meus\s+)?(?:quadros|boards|lousas)/i,
    /(?:cadê|cade|onde\s+(?:estão|estao))\s+(?:os\s+)?(?:meus\s+)?(?:quadros|boards|lousas)/i
  ],
  BOARD_NAME: [
    /(?:chamad[oa]|com\s+nome|nome)\s+["']?([^"']+?)["']?\s*$/i,
    /(?:criar|fazer|adicionar|novo|nova)\s+(?:um\s+)?(?:quadro|board|painel|lousa)\s+["']?([^"']+?)["']?\s*$/i,
    /(?:para|sobre|pra)\s+(?:meu|minha)?\s+(?:projeto|tarefa|trabalho)\s+(?:chamad[oa]|com nome)?\s+["']?([^"']+?)["']?\s*$/i,
    /(?:faz|cria|adiciona|bota|poe|põe|coloca)\s+(?:um\s+)?(?:quadro|board|painel|lousa)\s+(?:pro|para|pra)\s+(?:meu|minha)?\s+(?:projeto|tarefa)?\s+["']?([^"']+?)["']?\s*$/i,
    /(?:dá\s+pra|da\s+pra)\s+(?:criar|fazer|botar|por|pôr|colocar)\s+(?:um\s+)?(?:quadro|board|painel|lousa)\s+(?:chamad[oa]|com nome)?\s+["']?([^"']+?)["']?\s*$/i,
    /(?:faz|bota|poe|põe|coloca)\s+(?:aí|ai)\s+(?:um\s+)?(?:quadro|board|painel|lousa)\s+(?:chamad[oa]|com nome)?\s+["']?([^"']+?)["']?\s*$/i
  ],
  BOARD_INTENT: [
    /(?:criar|fazer|adicionar|novo|nova|preciso|quero|gostaria|pode|faz|cria|bota|põe|coloca)\s+(?:um\s+)?(?:quadro|board|painel|lousa)/i,
    /(?:eu preciso|eu quero|gostaria|pode|poderia|queria)\s+(?:de\s+)?(?:criar|fazer|adicionar|ter|botar|pôr|colocar)\s+(?:um\s+)?(?:quadro|board|painel|lousa)/i,
    /(?:preciso|quero)\s+(?:algo|uma forma|um jeito|uma maneira)\s+(?:para|de|pra)\s+(?:organizar|gerenciar)\s+(?:meu|minha|minhas)?\s+(?:trabalho|tarefas|projeto)/i,
    /(?:faz|cria|adiciona|bota|põe|coloca)\s+(?:um\s+)?(?:quadro|board|painel|lousa)\s+(?:pro|para|pra)\s+(?:mim|meu|minha)/i,
    /(?:dá\s+pra|da\s+pra|pode)\s+(?:criar|fazer|botar|pôr|colocar)\s+(?:um\s+)?(?:quadro|board|painel|lousa)/i,
    /(?:faz|bota|põe|coloca)\s+(?:aí|ai)\s+(?:um\s+)?(?:quadro|board|painel|lousa)/i
  ],
  LIST_INTENT: [
    /(?:criar|fazer|adicionar|nova|botar|pôr|colocar)\s+(?:uma\s+)?(?:lista)/i,
    /(?:eu preciso|eu quero|gostaria|pode|poderia)\s+(?:de\s+)?(?:criar|fazer|adicionar|ter|botar|pôr|colocar)\s+(?:uma\s+)?(?:lista)/i,
    /(?:faz|cria|adiciona|bota|põe|coloca)\s+(?:uma\s+)?(?:lista)\s+(?:pro|para|pra)\s+(?:mim|meu|minha)/i,
    /(?:dá\s+pra|da\s+pra|pode)\s+(?:criar|fazer|botar|pôr|colocar)\s+(?:uma\s+)?(?:lista)/i,
    /(?:faz|bota|põe|coloca)\s+(?:aí|ai)\s+(?:uma\s+)?(?:lista)/i
  ],
  CARD_INTENT: [
    /(?:criar|fazer|adicionar|novo|nova|botar|pôr|colocar)\s+(?:um\s+)?(?:cartão|card|tarefa)/i,
    /(?:eu preciso|eu quero|gostaria|pode|poderia)\s+(?:de\s+)?(?:criar|fazer|adicionar|ter|botar|pôr|colocar)\s+(?:um\s+)?(?:cartão|card|tarefa)/i,
    /(?:faz|cria|adiciona|bota|põe|coloca)\s+(?:um\s+)?(?:cartão|card|tarefa)\s+(?:pro|para|pra)\s+(?:mim|meu|minha)/i,
    /(?:dá\s+pra|da\s+pra|pode)\s+(?:criar|fazer|botar|pôr|colocar)\s+(?:um\s+)?(?:cartão|card|tarefa)/i,
    /(?:faz|bota|põe|coloca)\s+(?:aí|ai)\s+(?:um\s+)?(?:cartão|card|tarefa)/i
  ],
  CARD_MOVE_INTENT: [
    /(?:mover|muda|transferir|passar)\s+(?:um\s+)?(?:cartão|card|tarefa)/i,
    /(?:eu preciso|eu quero|gostaria|pode|poderia)\s+(?:de\s+)?(?:mover|mudar|transferir|passar)\s+(?:um\s+)?(?:cartão|card|tarefa)/i,
    /(?:coloca|põe|bota)\s+(?:esse|este|o)?\s+(?:cartão|card|tarefa)\s+(?:em|na|no|para|pra)\s+(?:outra|nova)?\s+(?:lista)/i,
    /(?:dá\s+pra|da\s+pra|pode)\s+(?:mover|mudar|transferir|passar)\s+(?:um\s+)?(?:cartão|card|tarefa)/i
  ],
  LIST_LIST_INTENT: [
    /(?:listar|mostrar|ver|exibir)\s+(?:as\s+)?(?:listas)\s+(?:do|de um|desse|deste)?\s+(?:quadro|board)/i,
    /(?:quais|que)\s+(?:listas)\s+(?:tem|existe[m]?|há)\s+(?:n[oa]|em|dentro\s+d[oa])?\s+(?:quadro|board)/i,
    /(?:me\s+)?(?:mostra|lista|exibe)\s+(?:as\s+)?(?:listas)\s+(?:do|de um|desse|deste)?\s+(?:quadro|board)/i
  ]
};
