import { describe, it, expect } from 'vitest';
import { ContractProcessor } from '../src/processors/ContractProcessor.js';

describe('Integration Tests', () => {
  const processor = new ContractProcessor();

  it('should process end-to-end contract analysis', async () => {
    const sampleContract = `
      EMPLOYMENT AGREEMENT
      1. PAYMENT: Company shall pay $100,000 annually.
      2. TERMINATION: Either party may terminate with 30 days notice.
      3. CONFIDENTIALITY: Employee shall maintain confidentiality.
    `;

    const result = await processor.processContract(sampleContract);
    
    expect(result).toHaveProperty('analysisId');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('clauses');
    expect(result).toHaveProperty('risks');
    expect(result).toHaveProperty('recommendations');
    expect(result.clauses).toBeInstanceOf(Array);
    expect(result.clauses.length).toBeGreaterThan(0);
  });

  it('should handle health check', async () => {
    const health = await processor.healthCheck();
    expect(health).toHaveProperty('status');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
  });
});