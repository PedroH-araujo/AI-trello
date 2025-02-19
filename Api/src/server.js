import express from 'express';
import { trelloOperations } from './index.js';
import { handleBoardCreation, handleListCreation, handleCardCreation, handleCardMovement, handleListListing } from './helpers.js';
import { MESSAGES, REGEX_PATTERNS } from './constants.js';
import { ConversationManager } from './conversationManager.js';
import { formatResponse, formatError } from './responseFormatter.js';
const app = express();
import cors from 'cors';


app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json());

const conversationManager = new ConversationManager();

async function parseAIResponse(response) {
  const match = response.match(/^\[(.*?)\]\s*(.*)/);
  if (match) {
    return {
      intent: match[1],
      response: match[2]
    };
  }
  return {
    intent: null,
    response
  };
}

async function handleBoardsResponse(action) {
  const boards = await trelloOperations.getBoards();
  return formatResponse(
    boards.length === 0 ? MESSAGES.NO_BOARDS_FOUND : MESSAGES.BOARD_LIST_HEADER,
    action,
    boards.map((board, index) => ({
      index: index + 1,
      name: board.name,
      id: board.id
    }))
  );
}

async function handleIntent(intent, response) {
  switch (intent) {
    case 'criar_quadro':
      return formatResponse(MESSAGES.BOARD_PROMPT, 'create_board', null);
    case 'listar_quadros':
      return handleBoardsResponse('list_boards');
    case 'criar_lista':
      return handleBoardsResponse('select_board_for_list');
    case 'listar_listas':
      return handleBoardsResponse('select_board_for_lists');
    case 'criar_cartao':
      return handleBoardsResponse('select_board_for_card');
    case 'mover_cartao':
      return handleBoardsResponse('select_board_for_card_move');
    default:
      return formatResponse(response, 'ai_response', null);
  }
}

async function handleUserMessage(message, conversationId) {
  const userInput = message.normalize('NFC');

  try {
    // Try LangChain first for natural language understanding
    const chain = await conversationManager.getChain(conversationId);
    const aiResponse = await chain.call({ input: userInput });
    let responseText = '';
    
    if (aiResponse.response && typeof aiResponse.response === 'string') {
      responseText = aiResponse.response;
    } else if (aiResponse.text) {
      responseText = aiResponse.text;
    } else if (aiResponse.generations && aiResponse.generations[0]) {
      responseText = aiResponse.generations[0].text;
    } else if (typeof aiResponse === 'string') {
      responseText = aiResponse;
    }

    const { intent, response } = await parseAIResponse(responseText);
    
    if (intent) {
      return handleIntent(intent, response);
    }

    console.log('User input:', userInput);
    // Fallback to regex patterns if no intent was identified
    if (REGEX_PATTERNS.BOARD_LIST_INTENT.some(pattern => userInput.match(pattern))) {
      return handleBoardsResponse('list_boards');
    }
    if (REGEX_PATTERNS.LIST_LIST_INTENT.some(pattern => userInput.match(pattern))) {
      return handleBoardsResponse('select_board_for_lists');
    }
    if (REGEX_PATTERNS.CARD_MOVE_INTENT.some(pattern => userInput.match(pattern))) {
      return handleBoardsResponse('select_board_for_card_move');
    }
    if (REGEX_PATTERNS.CARD_INTENT.some(pattern => userInput.match(pattern))) {
      return handleBoardsResponse('select_board_for_card');
    }
    if (REGEX_PATTERNS.LIST_INTENT.some(pattern => userInput.match(pattern))) {
      return handleBoardsResponse('select_board_for_list');
    }
    if (REGEX_PATTERNS.BOARD_INTENT.some(pattern => userInput.match(pattern))) {
      return formatResponse(MESSAGES.BOARD_PROMPT, 'create_board', null);
    }

    return formatResponse(response, 'ai_response', null);
  } catch (error) {
    return formatError(error);
  }
}

async function handleAction(action, data, conversationId) {
  try {
    switch (action) {
      case 'create_board': {
        const board = await trelloOperations.createBoard(data.name);
        if (data.lists) {
          for (const listName of data.lists) {
            await trelloOperations.createList(board.id, listName);
          }
        }
        return formatResponse(
          MESSAGES.BOARD_CREATED.replace('{name}', data.name),
          'board_created',
          board
        );
      }

      case 'create_list': {
        const list = await trelloOperations.createList(data.boardId, data.name);
        return formatResponse(
          MESSAGES.LIST_CREATED.replace('{name}', data.name),
          'list_created',
          list
        );
      }

      case 'create_card': {
        const card = await trelloOperations.createCard(data.listId, data.name, data.description);
        return formatResponse(
          MESSAGES.CARD_CREATED.replace('{name}', data.name),
          'card_created',
          card
        );
      }

      case 'move_card': {
        const card = await trelloOperations.moveCard(data.cardId, data.targetListId);
        return formatResponse(MESSAGES.CARD_MOVED, 'card_moved', card);
      }

      case 'get_lists': {
        const lists = await trelloOperations.getLists(data.boardId);
        return formatResponse(
          lists.length === 0 ? MESSAGES.NO_LISTS_FOUND : MESSAGES.LISTS_HEADER,
          'lists_retrieved',
          lists.map((list, index) => ({
            index: index + 1,
            name: list.name,
            id: list.id
          }))
        );
      }

      case 'get_cards': {
        const cards = await trelloOperations.getCards(data.listId);
        return formatResponse(
          cards.length === 0 ? '❌ Esta lista não tem cartões.' : '\nCartões disponíveis:',
          'cards_retrieved',
          cards.map((card, index) => ({
            index: index + 1,
            name: card.name,
            id: card.id
          }))
        );
      }

      default:
        return formatError(new Error('Ação não reconhecida'));
    }
  } catch (error) {
    return formatError(error);
  }
}

app.post('/chat', async (req, res) => {
  console.log('Requisição:', req.body);
  const { message, conversationId = 'default', action = null, data = null } = req.body;

  try {
    if (action) {
      const response = await handleAction(action, data, conversationId);
      res.json(response);
    } else if (message) {
      const response = await handleUserMessage(message, conversationId);
      res.json(response);
    } else {
      res.status(400).json(formatError(new Error('Requisição inválida. Forneça uma mensagem ou ação.')));
    }
  } catch (error) {
    res.status(500).json(formatError(error));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});