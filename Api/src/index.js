import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const TRELLO_API_BASE = 'https://api.trello.com/1';
const auth = `key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`;

const trelloOperations = {
  getBoards: async () => {
    try {
      const response = await fetch(`${TRELLO_API_BASE}/members/me/boards?${auth}&fields=name,id,url`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Erro ao buscar quadros: ${error.message}`);
    }
  },

  getLists: async (boardId) => {
    try {
      const response = await fetch(`${TRELLO_API_BASE}/boards/${boardId}/lists?${auth}&fields=name,id`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Erro ao buscar listas: ${error.message}`);
    }
  },

  createBoard: async (name) => {
    try {
      const response = await fetch(`${TRELLO_API_BASE}/boards?${auth}&name=${encodeURIComponent(name)}&defaultLists=false`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Erro ao criar quadro: ${error.message}`);
    }
  },

  createList: async (boardId, name) => {
    try {
      const response = await fetch(`${TRELLO_API_BASE}/lists?${auth}&name=${encodeURIComponent(name)}&idBoard=${boardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Erro ao criar lista: ${error.message}`);
    }
  },

  createCard: async (listId, name, desc) => {
    try {
      const response = await fetch(`${TRELLO_API_BASE}/cards?${auth}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, desc, idList: listId })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Erro ao criar cartão: ${error.message}`);
    }
  },

  getCards: async (listId) => {
    try {
      const response = await fetch(`${TRELLO_API_BASE}/lists/${listId}/cards?${auth}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Erro ao buscar cartões: ${error.message}`);
    }
  },

  moveCard: async (cardId, listId) => {
    try {
      const response = await fetch(`${TRELLO_API_BASE}/cards/${cardId}?${auth}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idList: listId })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Erro ao mover cartão: ${error.message}`);
    }
  }
};

export { trelloOperations };
