import express from 'express';
import { trelloOperations } from './index.js';
import { handleBoardCreation, handleListCreation, handleCardCreation, handleCardMovement, handleListListing } from './helpers.js';
import { MESSAGES, REGEX_PATTERNS } from './constants.js';
import { ConversationManager } from './conversationManager.js';
import { formatResponse, formatError } from './responseFormatter.js';
import { BufferMemory } from "langchain/memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
const app = express();
import cors from 'cors';


app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json());

const conversationManager = new ConversationManager();

// async function parseAIResponse(response) {
//   const match = response.match(/^\[(.*?)\]\s*(.*)/);
//   if (match) {
//     return {
//       intent: match[1],
//       response: match[2]
//     };
//   }
//   return {
//     intent: null,
//     response
//   };
// }

function parseAIResponse2(response) {
  // Remove aspas duplas do início e fim, se existirem
  if (response.startsWith('"') && response.endsWith('"')) {
    response = response.substring(1, response.length - 1);
  }
  
  // Remove espaços ou quebras de linha do início e fim
  const trimmedResponse = response.trim();
  const match = trimmedResponse.match(/^\[(.*?)\]\s*(.*)$/s);
  if (match) {
    const paramsString = match[1].trim();
    // Separa os parâmetros pela vírgula (removendo espaços em branco ao redor)
    const paramsArray = paramsString.split(/\s*,\s*/);

    const data = {};
    paramsArray.forEach(param => {
      // Separa apenas na primeira ocorrência de "=" para suportar valores com "="
      const [key, ...rest] = param.split('=');
      if (key && rest.length > 0) {
        data[key.trim()] = rest.join('=').trim();
      }
    });

    if (Object.keys(data).length === 0) {
      return {
        newAction: null,
        newParams: null,
        newResponse: response
      };
    }

    return {
      newAction: data.action || null,
      newParams: data,
      newResponse: match[2].trim()
    };
  }

  return {
    newAction: null,
    newParams: null,
    newResponse: response
  };
}

// async function handleBoardsResponse(action) {
//   const boards = await trelloOperations.getBoards();
//   const boardsWithLists = await Promise.all(boards.map(async board => {
//     const lists = await trelloOperations.getLists(board.id);
//     return {
//       ...board,
//       lists
//     };
//   }
//   ));

//   return formatResponse(
//     boards.length === 0 ? MESSAGES.NO_BOARDS_FOUND : MESSAGES.BOARD_LIST_HEADER,
//     action,
//     boardsWithLists.map((board, index) => ({
//       index: index + 1,
//       name: board.name,
//       id: board.id,
//       lists: board.lists
//     }))
//   );
// }

// async function handleIntent(intent, response) {
//   switch (intent) {
//     case 'create_board':
//       return formatResponse(MESSAGES.BOARD_PROMPT, 'create_board', null);
//     case 'list_boards':
//       return handleBoardsResponse('list_boards');
//     case 'create_list':
//       return handleBoardsResponse('select_board_for_list');
//     case 'list_lists':
//       return handleBoardsResponse('select_board_for_lists');
//     case 'create_card':
//       return handleBoardsResponse('select_board_for_card');
//     case 'move_card':
//       return handleBoardsResponse('select_board_for_card_move');
//     default:
//       return formatResponse(response, 'ai_response', null);
//   }
// }

// async function handleUserMessage(message, conversationId) {
//   const userInput = message.normalize('NFC');
//   console.log('User inputCEEC:', userInput);

//   try {
//     // Try LangChain first for natural language understanding
//     const chain = await conversationManager.getChainResponse(conversationId);
//     // console.log('Chain:', chain);
//     const aiResponse = await chain.invoke({
//       question: userInput,
//       history: history
//     });

//     console.log('AI response:XXX', aiResponse);

//     const memory = conversationManager.memories.get(conversationId);
//     if (memory) {
//       // Supondo que o formato de input e output seja um objeto com 'question' e 'answer'
//       await memory.saveContext({ question: userInput }, { answer: aiResponse.content });
//     }
//     let responseText = '';
    
//     if (aiResponse.response && typeof aiResponse.response === 'string') {
//       responseText = aiResponse.response;
//     } else if (aiResponse.text) {
//       responseText = aiResponse.text;
//     } else if (aiResponse.generations && aiResponse.generations[0]) {
//       responseText = aiResponse.generations[0].text;
//     } else if (typeof aiResponse === 'string') {
//       responseText = aiResponse;
//     }

//     const { newAction, newResponse } = await parseAIResponse2(responseText);
    
//     if (newAction) {
//       return handleIntent(newAction, newResponse);
//     }

//     console.log('User inputADWWD:', userInput);
//     // Fallback to regex patterns if no intent was identified
//     // if (REGEX_PATTERNS.BOARD_LIST_INTENT.some(pattern => userInput.match(pattern))) {
//     //   return handleBoardsResponse('list_boards');
//     // }
//     // if (REGEX_PATTERNS.LIST_LIST_INTENT.some(pattern => userInput.match(pattern))) {
//     //   return handleBoardsResponse('select_board_for_lists');
//     // }
//     // if (REGEX_PATTERNS.CARD_MOVE_INTENT.some(pattern => userInput.match(pattern))) {
//     //   return handleBoardsResponse('select_board_for_card_move');
//     // }
//     // if (REGEX_PATTERNS.CARD_INTENT.some(pattern => userInput.match(pattern))) {
//     //   return handleBoardsResponse('select_board_for_card');
//     // }
//     // if (REGEX_PATTERNS.LIST_INTENT.some(pattern => userInput.match(pattern))) {
//     //   return handleBoardsResponse('select_board_for_list');
//     // }
//     // if (REGEX_PATTERNS.BOARD_INTENT.some(pattern => userInput.match(pattern))) {
//     //   return formatResponse(MESSAGES.BOARD_PROMPT, 'create_board', null);
//     // }

//     console.log('PASSOU AQUI')

//     return formatResponse(newResponse, 'ai_response', null);
//   } catch (error) {
//     return formatError(error);
//   }
// }

async function handleAction(action, data, conversationId) {
  try {
    switch (action) {
      case 'create_board': {
        const board = await trelloOperations.createBoard(data.name);

        return formatResponse(
          MESSAGES.BOARD_CREATED.replace('{name}', data.name),
          'board_created',
          board
        );
      }

      case 'create_list': {
        const list = await trelloOperations.createList(data.board_id, data.name);
        return formatResponse(
          MESSAGES.LIST_CREATED.replace('{name}', data.name),
          'list_created',
          list
        );
      }

      case 'create_card': {
        const card = await trelloOperations.createCard(data.list_id, data.name, data.description);
        return formatResponse(
          MESSAGES.CARD_CREATED.replace('{name}', data.name),
          'card_created',
          card
        );
      }

      case 'move_card': {
        const card = await trelloOperations.moveCard(data.card_id, data.list_id);
        return formatResponse(
          MESSAGES.CARD_MOVED.replace('{name}', card.name),
          'card_moved',
          card
        );
      }

      case 'get_lists': {
        const lists = await trelloOperations.getLists(data.board_id);
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

function formatHistory(history) {
  // Para cada turno, converte para duas mensagens: uma do usuário e outra da IA
  return history.flatMap(turn => [
    new HumanMessage({ content: turn.user }),
    new AIMessage({ content: turn.ai })
  ]);
}

async function NLPResponse(message, conversationId = 'default') {
  const userInput = message.normalize('NFC');

  const chain = await conversationManager.getChainResponse(conversationId);
  
  console.log('User input:', userInput);

  // Chama a chain sem converter o histórico aqui
  const aiResponse = await chain.invoke({
    question: userInput,
    history: []  // Pode ser vazio, já que memoryRunnable vai adicionar o histórico
  });

  console.log('AI response:', aiResponse);

  // Atualize o histórico simples
  conversationManager.memories.push({
    user: userInput,
    ai: aiResponse.content
  });
  // const memory = conversationManager.memories.get(conversationId);
  // if (memory) {
  //   // Supondo que o formato de input e output seja um objeto com 'question' e 'answer'
  //   await memory.saveContext({ question: userInput }, { answer: aiResponse.content });
  // }
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

  console.log('AI responseXASSDCESSF:', responseText);

  const formattedResponse = parseAIResponse2(responseText);

  console.log('formattedResponseadw:', formattedResponse);
  // console.log('Paramsfsrgsrg:', newParams);
  // console.log('Responsehdtr:', newResponse);

  // console.log('Action:', newAction);
  // console.log('Params:', newParams);
  // console.log('Response:', newResponse);

  const { newAction, newParams, newResponse } = formattedResponse;

  return { newAction, newParams, newResponse };

}

function checkParams(action, data) {

  console.log('ActionXXX:', action);
  console.log('PATASDAWDSDAAWD:', data);
  const requiredFields = {
    create_board: ["name"],
    create_list: ["board_id", "name"],
    create_card: ["list_id", "name"],
    move_card: ["card_id", "list_id"],
  };

  return requiredFields[action]?.every(field => data[field]) ?? false;
}

app.post('/chat', async (req, res) => {
  let newAction = null;
  let newParams = null;
  let newResponse = null;
  
  console.log('Requisição:', req.body);
  const { message, conversationId = 'default', action = null, data = null } = req.body;

  const resX = await NLPResponse(message, conversationId);

  newAction = resX.newAction;
  newParams = resX.newParams;
  newResponse = resX.newResponse;

  console.log('Action:', newAction);
  console.log('Params:', newParams);
  console.log('Response:', newResponse);

  const validateParams = checkParams(newAction, newParams);

  console.log('Validar parâmetros:', validateParams);

  if(!validateParams) {
    newResponse = newResponse.replace(/\[.*?\]\s*/g, '');
  }

  try {
    if (newAction && validateParams) {
      const response = await handleAction(newAction, newParams, conversationId);
      return res.json(response);
    }
    console.log('XSXSSX', formatResponse(newResponse))
    return res.json(formatResponse(newResponse));
    //  else if(newAction && !validateParams) {
    //   const formattedResponse = formatResponse(newResponse, 'ai_response', null);
    //   res.json(formattedResponse);
    // } else if (message) {
    //   const response = await handleUserMessage(message, conversationId);
    //   res.json(response);
    // } else {
    //   res.status(400).json(formatError(new Error('Requisição inválida. Forneça uma mensagem ou ação.')));
    // }
  } catch (error) {
    console.log('ERER')
    res.status(500).json(formatError(error));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});