import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Row = { department: string; allocated: number; spent: number };

@Component({
  selector: 'app-finance-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budgets.component.html'
})
export class BudgetsComponent {
  // Placeholder data until backend exposes budgets endpoints
  rows: Row[] = [
    { department: 'HR', allocated: 120000, spent: 86000 },
    { department: 'Finance', allocated: 90000, spent: 72000 },
    { department: 'IT', allocated: 200000, spent: 167500 },
    { department: 'Sales', allocated: 150000, spent: 141200 },
  ];

  get utilization() {
    const totalAlloc = this.rows.reduce((s, r) => s + r.allocated, 0);
    const totalSpent = this.rows.reduce((s, r) => s + r.spent, 0);
    return totalAlloc ? (totalSpent / totalAlloc) * 100 : 0;
  }
}

