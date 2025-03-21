import { chain, trelloOperations } from './index.js';
import { handleBoardCreation, handleListCreation, handleCardCreation, handleCardMovement, handleListListing, handleError, showHelp, handleBoardListing } from './helpers.js';
import { MESSAGES, REGEX_PATTERNS } from './constants.js';
import { BufferMemory } from "langchain/memory";
const memory = new BufferMemory();
const memoryVariables = await memory.loadMemoryVariables({});
const history = memoryVariables.chat_history || [];  // Se não houver histórico, usa string vazia


// import readline from 'readline';

// process.stdin.setEncoding('utf8');
// process.stdout.setDefaultEncoding('utf8');

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
//   terminal: true
// });

// rl.on('line', (input) => {
//   const normalizedInput = input.normalize('NFC');
//   handleUserInput(normalizedInput);
// });

export async function handleUserInput(input) {
  try {
    const userInput = input;

    if (userInput === 'help' || userInput === 'ajuda') {
      return showHelp();
      // promptUser();
    }

    const boardListIntent = REGEX_PATTERNS.BOARD_LIST_INTENT.some(pattern => userInput.match(pattern));
    if (boardListIntent) {
      await handleBoardListing(trelloOperations, promptUser);
      return;
    }

    const boardIntent = REGEX_PATTERNS.BOARD_INTENT.some(pattern => userInput.match(pattern));
    const normalizedInput = userInput.normalize('NFC').toLowerCase();
    const withListsMatch = REGEX_PATTERNS.BOARD_WITH_LISTS
      .find(pattern => userInput.match(pattern));
    
    let listPreference = null;
    if (withListsMatch) {
      const matchText = withListsMatch.exec(userInput)[0].normalize('NFC').toLowerCase();
      listPreference = matchText.match(/padr(?:a|ã)o|default/i) ? 'padrao' : 'custom';
    } else if (REGEX_PATTERNS.BOARD_LIST_PREFERENCE.some(pattern => normalizedInput.match(pattern))) {
      listPreference = normalizedInput.match(/padr(?:a|ã)o|default/i) ? 'padrao' : 'custom';
    }

    const isAmbiguousRequest = userInput.match(/(?:algo|uma forma)\s+(?:para|de)\s+(?:organizar|gerenciar)/i);
    const extractedName = !isAmbiguousRequest ? (
      withListsMatch ? 
        withListsMatch.exec(userInput)[1].trim() :
        REGEX_PATTERNS.BOARD_NAME.map(pattern => userInput.match(pattern)?.[1]).find(match => match)
    ) : null;
    
    const cleanBoardName = extractedName?.split(/\s+com\s+listas?\s+/i)[0];
    
    if (!extractedName && !isAmbiguousRequest && boardIntent) {
      rl.question(MESSAGES.BOARD_PROMPT, async (boardName) => {
        try {
          await handleBoardCreation(boardName.trim(), trelloOperations, rl, promptUser, listPreference);
        } catch (error) {
          handleError(error);
          // promptUser();
        }
      });
      return;
    }

    if (boardIntent) {
      await handleBoardCreation(cleanBoardName, trelloOperations, rl, promptUser, listPreference);
      return;
    }

    const listIntent = REGEX_PATTERNS.LIST_INTENT.some(pattern => userInput.match(pattern));
    if (listIntent) {
      await handleListCreation(trelloOperations, rl, promptUser);
      return;
    }

    const cardIntent = REGEX_PATTERNS.CARD_INTENT.some(pattern => userInput.match(pattern));
    if (cardIntent) {
      await handleCardCreation(trelloOperations, rl, promptUser);
      return;
    }

    const cardMoveIntent = REGEX_PATTERNS.CARD_MOVE_INTENT.some(pattern => userInput.match(pattern));
    if (cardMoveIntent) {
      await handleCardMovement(trelloOperations, rl, promptUser);
      return;
    }

    const listListIntent = REGEX_PATTERNS.LIST_LIST_INTENT.some(pattern => userInput.match(pattern));
    if (listListIntent) {
      await handleListListing(trelloOperations, rl, promptUser);
      return;
    }

    const response = await chain.invoke({
      question: userInput,
      history: history
    });
    const intent = response.response.toLowerCase();
    console.log('Assistente:', response.response);
    
    if (intent.includes('criar') || intent.includes('fazer') || intent.includes('novo') || 
        intent.includes('preciso') || intent.includes('quero') || intent.includes('gostaria')) {
      if (intent.includes('quadro') || intent.includes('projeto') || 
          intent.includes('organizar') || intent.includes('gerenciar')) {
        await handleBoardCreation(cleanBoardName, trelloOperations, rl, promptUser, listPreference);
        return;
      } else if (intent.includes('lista')) {
        await handleListCreation(trelloOperations, rl, promptUser);
        return;
      } else if (intent.includes('cartão') || intent.includes('tarefa')) {
        await handleCardCreation(trelloOperations, rl, promptUser);
        return;
      }
    }
    // promptUser();
  } catch (error) {
    if (error.message.includes('OpenAI')) {
      console.error('❌ Erro: Erro na API do OpenAI. Verifique suas credenciais no arquivo .env');
    } else {
      console.error('❌ Error:', error.message);
    }
    // promptUser();
  }
}

// function promptUser() {
//   process.stdout.write('Você: ');
// }

console.log(MESSAGES.WELCOME);
console.log(MESSAGES.HELP_PROMPT);
// promptUser();

process.on('SIGINT', () => {
  rl.close();
  process.exit(0);
});
