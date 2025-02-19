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
  handleCreateBoard = false;

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
    const currentMessage = this.handleCreateBoard ? { action: 'create_board', data: { name: this.inputMessage } } : this.inputMessage;
    this.inputMessage = '';
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.chatService.sendMessage(currentMessage).toPromise();

      if (response.action === 'list_boards' || response.action === 'select_board_for_list') {
        this.messages.push({
          text: 'Aqui estão as boards disponíveis:',
          timestamp: new Date().toISOString(),
          isUser: false
        });

        response.data.forEach((board: { name: any; }, index: number) => {
          this.messages.push({
            text: `${index + 1}. ${board.name}`,
            timestamp: new Date().toISOString(),
            isUser: false
          });
        });

        return;
      }
      if (response.action === 'create_board') {
        this.handleCreateBoard = true;
      }
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
