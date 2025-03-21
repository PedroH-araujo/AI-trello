import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../services/chat.service';

@Component({
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ChatWidgetComponent implements OnInit {
  messages: ChatMessage[] = [{
    text: 'Olá! Como posso ajudar você hoje?',
    timestamp: new Date().toISOString(),
    isUser: false
  }];
  inputMessage = '';
  isLoading = false;
  error: string | null = null;
  // handleCreateBoard = false;
  // handleCreateCard = false;
  BOARD_LIST_ACTIONS = ['list_boards', 'select_board_for_list', 'select_board_for_card', 'select_board_for_lists', 'select_board_for_card_move'];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {}

  async sendMessage(): Promise<void> {
    if (!this.inputMessage.trim() || this.isLoading) return;

    const newMessage: ChatMessage = {
      text: this.inputMessage,
      timestamp: new Date().toISOString(),
      isUser: true
    };

    this.messages.push(newMessage);
    const currentMessage = this.inputMessage;
    this.inputMessage = '';
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.chatService.sendMessage(currentMessage).toPromise();

      // if (this.BOARD_LIST_ACTIONS.includes(response.action)) {
      //   this.messages.push({
      //     text: response.action === 'list_boards' ? 'Aqui estão as boards disponíveis:' : `Aqui estão as boards disponíveis, para realizar a ação desejada:\n
      //     - Para criar uma lista informe o ID da board seguido do nome da lista\n
      //     - Para listar as listas de uma board informe apenas o ID da board\n
      //     - Para criar um card informe o ID da lista seguido do nome do card\n,
      //     - Para mover um card informe o ID do card seguido do ID da lista de destino\n`,
      //     timestamp: new Date().toISOString(),
      //     isUser: false
      //   });

      // const boardsList = response.data.map((board: { name: string; id: string; lists: { name: string; id: string; }[] }, index: number) =>
      //   `${index + 1}. Board: ${board.name} (ID: ${board.id})\n` +
      //   (board.lists.length > 0
      //     ? board.lists.map((list, listIndex) => `   - ${listIndex + 1}. Lista: ${list.name} (ID: ${list.id})`).join('\n')
      //     : '   - Nenhuma lista disponível.')
      // ).join('\n\n');


      //   this.messages.push({
      //     text: `Aqui estão as boards disponíveis:\n\n${boardsList}`,
      //     timestamp: new Date().toISOString(),
      //     isUser: false
      //   });

      //   // if (response.action === 'select_board_for_card') {
      //   //   this.handleCreateCard = true;
      //   // }


      //   return;
      // }

      // if (response.action === 'lists_retrieved') {
      //   this.messages.push({
      //     text: `Aqui estão as listas disponíveis, para realizar a ação desejada:\n
      //     - Para criar um card informe o ID da lista seguido do nome do card\n`,
      //     timestamp: new Date().toISOString(),
      //     isUser: false
      //   });

      //   const boardListing = response.data.map((list: { name: string; id: string; }, index: number) =>
      //     `${index + 1}. ID: ${list.id} - Nome: ${list.name}`
      //   ).join('\n\n');

      //   this.messages.push({
      //     text: `Aqui estão as listas disponíveis:\n\n${boardListing}`,
      //     timestamp: new Date().toISOString(),
      //     isUser: false
      //   });

      //   return
      // }

      // if (response.action === 'create_board') {
      //   this.handleCreateBoard = true;
      // }
      this.messages.push({
        text: response.message,
        timestamp: response.timestamp,
        isUser: false
      });
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao conectar com o servidor';
      this.messages.pop();
    } finally {
      this.isLoading = false;
    }
  }
}
