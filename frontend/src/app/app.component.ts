import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { SiteData } from './core/site.models';
import { SiteService } from './core/site.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  @ViewChild('heroVideo') private heroVideo?: ElementRef<HTMLVideoElement>;
  private readonly siteService = inject(SiteService);
  private readonly title = inject(Title);
  private readonly fb = inject(FormBuilder);
  readonly site = signal<SiteData | null>(null);
  readonly loadFailed = signal(false);
  readonly mobileMenu = signal(false);
  readonly videoPlaying = signal(false);
  readonly sending = signal(false);
  readonly contactStatus = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  readonly contactForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
  });

  constructor() {
    this.siteService.getSite().subscribe({
      next: data => {
        this.site.set(data);
        this.title.setTitle(data.settings['page_title']);
      },
      error: () => this.loadFailed.set(true)
    });
  }

  scrollTo(target: string): void {
    document.getElementById(target)?.scrollIntoView({ behavior: this.reducedMotion ? 'auto' : 'smooth' });
    this.mobileMenu.set(false);
  }

  toggleVideo(): void {
    const video = this.heroVideo?.nativeElement;
    if (!video) return;
    if (video.paused) video.play().then(() => this.videoPlaying.set(true)).catch(() => this.videoPlaying.set(false));
    else { video.pause(); this.videoPlaying.set(false); }
  }

  sendContact(): void {
    const data = this.site();
    if (!data || this.contactForm.invalid || this.sending()) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.sending.set(true);
    this.contactStatus.set(null);
    this.siteService.sendContact(this.contactForm.getRawValue()).pipe(finalize(() => this.sending.set(false))).subscribe({
      next: response => { this.contactStatus.set({ type: 'success', text: response.message }); this.contactForm.reset(); },
      error: error => this.contactStatus.set({ type: 'error', text: error?.error?.error || data.ui['contact_error'] })
    });
  }

  fieldError(field: 'name' | 'email' | 'message'): string {
    const control = this.contactForm.controls[field];
    const ui = this.site()?.ui;
    if (!ui || !control.touched || !control.errors) return '';
    if (control.errors['required']) return ui[`validation_${field}_required`];
    if (control.errors['email']) return ui['validation_email_invalid'];
    if (control.errors['minlength']) return ui[`validation_${field}_short`];
    return '';
  }
}

