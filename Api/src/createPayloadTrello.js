 import { trelloOperations } from './index.js';
 import { loadDocuments } from './loaderTrello.js';
 import fs from 'fs';
 
 async function prePayload() {
  const boards = await trelloOperations.getBoards();
  const boardsWithLists = await Promise.all(boards.map(async board => {
    const lists = await trelloOperations.getLists(board.id);
    const listsWithCards = await Promise.all(lists.map(async list => {
      const cards = await trelloOperations.getCards(list.id);
      return {
        ...list,
        cards
      };
    }));
    return {
      ...board,
      lists: listsWithCards
    };
  }
  ));

  console.log(JSON.stringify(boardsWithLists, null, 2));
  generateTextFile(boardsWithLists);
}

async function generateTextFile(boards) {
  let textContent = "**Quadros Disponíveis:**\n\n";
  
  boards.forEach((board) => {
    textContent += `Quadro. ${board.name}\n`;
    textContent += `  -Id: ${board.id}\n`;
      
      textContent += `   **Listas:**\n`;

      if (!board.lists || board.lists.length === 0) {
          textContent += `     - Este quadro não tem listas.\n\n`;
          return;
      }
      
      board.lists.forEach((list) => {
          textContent += `   -Lista. ${list.name}:\n`;
          textContent += `     -Id: ${list.id}\n`;

          textContent += `   **Cartoes:**\n`;
          
          if (!list.cards || list.cards.length === 0) {
              textContent += `     - Lista atualmente sem cartões.\n`;
          } else {
              list.cards.forEach((card) => {
                  textContent += `     -Cartão. ${card.name}\n`;
                  textContent += `       -Id: ${card.id}\n`;
              });
          }
          
          textContent += "\n";
      });

      textContent += "[BOARD_END]\n\n";
  });

  fs.writeFileSync('src/data/boards_info.txt', textContent, 'utf8');
  console.log('Arquivo boards_info.txt gerado com sucesso!');
  
  await loadDocuments();
}

prePayload();