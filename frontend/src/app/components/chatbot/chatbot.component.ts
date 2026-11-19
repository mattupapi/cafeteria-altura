import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { SiteService } from '../../core/site.service';
import { ChatMessage } from '../../core/site.models';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  @Input({ required: true }) ui!: Record<string, string>;
  @ViewChild('chatInput') private chatInput?: ElementRef<HTMLInputElement>;
  private readonly siteService = inject(SiteService);
  private sequence = 0;
  readonly open = signal(false);
  readonly waiting = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  readonly input = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] });
  readonly form = new FormGroup({ message: this.input });
  readonly lastFailedQuery = signal<string | null>(null);

  toggle(): void {
    this.open.update(value => !value);
    if (this.open() && this.messages().length === 0) {
      this.messages.set([{ id: ++this.sequence, sender: 'assistant', text: this.ui['chat_greeting'] }]);
      setTimeout(() => this.chatInput?.nativeElement.focus());
    }
  }

  ask(text?: string, retry = false): void {
    const query = (text ?? this.input.value).trim();
    if (!query || this.waiting()) return;
    if (retry) this.messages.update(items => items.filter(item => !item.error));
    else this.messages.update(items => [...items, { id: ++this.sequence, sender: 'user', text: query }]);
    this.input.setValue('');
    this.waiting.set(true);
    this.lastFailedQuery.set(null);
    const history = this.messages().slice(-6, -1).map(item => ({
      role: item.sender === 'assistant' ? 'assistant' : 'user', content: item.text
    }));
    this.siteService.sendChat(query, history).pipe(finalize(() => this.waiting.set(false))).subscribe({
      next: ({ reply }) => {
        this.lastFailedQuery.set(null);
        this.messages.update(items => [...items, { id: ++this.sequence, sender: 'assistant', text: reply }]);
      },
      error: (error) => {
        this.input.setValue(query);
        this.lastFailedQuery.set(query);
        this.messages.update(items => [...items, {
          id: ++this.sequence, sender: 'assistant', text: error?.error?.error || this.ui['chat_error'], error: true
        }]);
      }
    });
  }

  retry(): void {
    const query = this.lastFailedQuery();
    if (query) this.ask(query, true);
  }

  @HostListener('window:keydown.escape') closeWithEscape(): void { if (this.open()) this.open.set(false); }
}

