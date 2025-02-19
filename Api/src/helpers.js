import { MESSAGES } from './constants.js';

export async function handleBoardCreation(data, trelloOperations) {
  try {
    const board = await trelloOperations.createBoard(data.name);
    if (data.lists) {
      for (const listName of data.lists) {
        await trelloOperations.createList(board.id, listName.trim());
      }
    }
    return {
      board,
      message: MESSAGES.BOARD_CREATED.replace('{name}', data.name)
    };
  } catch (error) {
    throw new Error(`Erro ao criar quadro: ${error.message}`);
  }
}

export async function handleListCreation(data, trelloOperations) {
  try {
    const list = await trelloOperations.createList(data.boardId, data.name);
    return {
      list,
      message: MESSAGES.LIST_CREATED.replace('{name}', data.name)
    };
  } catch (error) {
    throw new Error(`Erro ao criar lista: ${error.message}`);
  }
}

export async function handleCardCreation(data, trelloOperations) {
  try {
    const card = await trelloOperations.createCard(data.listId, data.name, data.description);
    return {
      card,
      message: MESSAGES.CARD_CREATED.replace('{name}', data.name)
    };
  } catch (error) {
    throw new Error(`Erro ao criar cartão: ${error.message}`);
  }
}

export async function handleCardMovement(data, trelloOperations) {
  try {
    const card = await trelloOperations.moveCard(data.cardId, data.targetListId);
    return {
      card,
      message: MESSAGES.CARD_MOVED
    };
  } catch (error) {
    throw new Error(`Erro ao mover cartão: ${error.message}`);
  }
}

export async function handleListListing(data, trelloOperations) {
  try {
    const lists = await trelloOperations.getLists(data.boardId);
    return {
      lists,
      message: lists.length === 0 ? MESSAGES.NO_LISTS_FOUND : MESSAGES.LISTS_HEADER
    };
  } catch (error) {
    throw new Error(`Erro ao listar listas: ${error.message}`);
  }
}
