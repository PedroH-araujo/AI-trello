import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  text: string;
  timestamp: string;
  isUser: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http: HttpClient) {}

  sendMessage(message: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/chat`, { message, action: message?.action, data: message?.data });
  }
}
