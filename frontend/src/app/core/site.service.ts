import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SiteData } from './site.models';

@Injectable({ providedIn: 'root' })
export class SiteService {
  private readonly http = inject(HttpClient);
  getSite(): Observable<SiteData> { return this.http.get<SiteData>('/api/site'); }
  sendContact(payload: { name: string; email: string; message: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/contact', payload);
  }
  sendChat(message: string, history: { role: string; content: string }[]): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>('/api/chat', { message, history });
  }
}

