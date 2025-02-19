import { Component, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { ChatWidgetComponent } from './chat-widget/chat-widget.component';

@Component({
  selector: 'app-root',
  template: '<app-chat-widget></app-chat-widget>',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [ChatWidgetComponent]
})
export class AppComponent {
  constructor(private injector: Injector) {
    // Register the web component
    const chatWidget = createCustomElement(ChatWidgetComponent, { injector });
    if (!customElements.get('chat-widget')) {
      customElements.define('chat-widget', chatWidget);
    }
  }
}
