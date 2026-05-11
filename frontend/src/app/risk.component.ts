
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-risk',
  template: `
    <div class="card">
      <h3>Risk Prediction</h3>
      <form (ngSubmit)="run()" class="form-grid">
        <div class="field">
          <label for="age">Age</label>
          <input id="age" [(ngModel)]="age" name="age" type="number">
        </div>
        <div class="field">
          <label for="los">Length of Stay</label>
          <input id="los" [(ngModel)]="los" name="los" type="number">
        </div>
        <div class="field">
          <label for="bp">Systolic BP</label>
          <input id="bp" [(ngModel)]="bp" name="bp" type="number">
        </div>
        <button class="btn" type="submit">Predict</button>
      </form>
      <pre *ngIf="result" class="result">{{result | json}}</pre>
    </div>
  `,
  styles: [`
    .card {
      background: #fff;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }
    h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 1.25rem; }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      align-items: end;
    }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-size: .8rem; font-weight: 600; color: #475569; }
    .field input {
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: .9rem;
      transition: border-color .2s;
    }
    .field input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.15); }
    .btn {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: .9rem;
      cursor: pointer;
      transition: background .2s;
      align-self: end;
    }
    .btn:hover { background: #1d4ed8; }
    .result {
      margin-top: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px;
      font-size: .85rem;
      overflow-x: auto;
    }
  `]
})
export class RiskComponent {
  age=65; los=4; bp=130; result:any;
  constructor(private api: ApiService) {}
  run(){ this.api.predict({ age:this.age, los:this.los, bp_systolic:this.bp }).subscribe(r => this.result = r); }
}
