import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'riskLevel', standalone: true })
export class RiskLevelPipe implements PipeTransform {
  transform(score: number): string {
    if (score >= 0.7) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  }
}
