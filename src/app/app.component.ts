import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentComponent } from './Components/Assessment';

@Component({
  selector: 'app-Assessment',
  standalone: true,
  imports: [CommonModule, AssessmentComponent],
  template: `
  <div class="app">
    <aside class="sidebar">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:36px;height:36px;border-radius:6px;background:#fff3;display:flex;align-items:center;justify-content:center;font-weight:700;">A&H</div>
        <div>
          <div style="font-weight:700">A&H</div>
          <div class="small">Welcome Back</div>
        </div>
      </div>
      <nav style="margin-top:28px">
        <div class="small" style="padding:8px 0">Content</div>
        <div style="padding:6px 0;color:#93c5fd">Content Upload</div>
      </nav>
    </aside>

    <main class="main">
      <app-assessment></app-assessment>
    </main>
  </div>
  `
})
export class AppComponent {}

