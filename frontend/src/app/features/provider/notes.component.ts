import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  selector: 'app-provider-notes',
  template: `
    <app-card title="Clinical Notes">
      <div class="notes">
        <div *ngFor="let n of notes" class="note">
          <div class="note-header"><strong>{{n.patient}}</strong> — {{n.date}}</div>
          <p>{{n.text}}</p>
        </div>
      </div>
      <div class="new-note">
        <textarea [(ngModel)]="newNote" placeholder="Add a clinical note..." rows="3"></textarea>
        <button class="btn" (click)="addNote()">Save Note</button>
      </div>
    </app-card>
  `,
  styles: [`
    .notes { margin-bottom: 16px; }
    .note { padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
    .note-header { font-size: .85rem; color: #475569; }
    .note p { margin: 4px 0 0; font-size: .9rem; color: #1e293b; }
    .new-note textarea {
      width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;
      font-size: .9rem; resize: vertical; font-family: inherit;
    }
    .new-note textarea:focus { outline: none; border-color: #2563eb; }
    .btn {
      margin-top: 8px; background: #2563eb; color: #fff; border: none; padding: 10px 20px;
      border-radius: 6px; font-size: .9rem; cursor: pointer;
    }
    .btn:hover { background: #1d4ed8; }
  `]
})
export class ProviderNotesComponent {
  newNote = '';
  notes = [
    { patient: 'John Smith', date: '2026-04-05', text: 'Patient responding well to new medication regimen.' },
    { patient: 'Robert Davis', date: '2026-04-03', text: 'Scheduled follow-up for pulmonary function test.' }
  ];
  addNote() {
    if (this.newNote.trim()) {
      this.notes.unshift({ patient: 'Current Patient', date: new Date().toISOString().slice(0, 10), text: this.newNote });
      this.newNote = '';
    }
  }
}
