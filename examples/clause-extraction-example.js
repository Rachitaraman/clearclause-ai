import { ContractProcessor } from '../src/processors/ContractProcessor.js';
import fs from 'fs';
import path from 'path';

/**
 * Example usage of the AI Contract Analysis system
 * Demonstrates clause extraction with AWS and Gemini integration
 */

async function demonstrateClauseExtraction() {
  console.log('🚀 Starting AI Contract Analysis Demo...\n');
  
  try {
    // Initialize the contract processor
    const processor = new ContractProcessor();
    
    // Example contract text
    const sampleContract = `
      EMPLOYMENT AGREEMENT
      
      This Employment Agreement ("Agreement") is entered into between Company ABC ("Company") and John Doe ("Employee").
      
      1. PAYMENT TERMS: The Company shall pay Employee a base salary of $100,000 per year, payable in bi-weekly installments.
      
      2. TERMINATION: Either party may terminate this agreement with 30 days written notice. Upon termination, Employee shall return all company property.
      
      3. CONFIDENTIALITY: Employee agrees to maintain confidentiality of all proprietary information and trade secrets of the Company during and after employment.
      
      4. LIABILITY LIMITATION: Company's liability shall be limited to the amount of compensation paid to Employee in the 12 months preceding the claim.
      
      5. INTELLECTUAL PROPERTY: All work products, inventions, and intellectual property created by Employee during employment shall belong to the Company.
      
      6. GOVERNING LAW: This Agreement shall be governed by the laws of the State of California.
      
      7. DISPUTE RESOLUTION: Any disputes arising under this Agreement shall be resolved through binding arbitration.
    `;
    
    console.log('📄 Processing sample employment contract...\n');
    
    // Process the contract
    const analysis = await processor.processContract(sampleContract, {
      filename: 'sample-employment-contract.txt',
      mimeType: 'text/plain'
    });
    
    // Display results
    console.log('✅ Analysis Complete!\n');
    console.log('📊 SUMMARY:');
    console.log(`   Total Clauses: ${analysis.summary.totalClauses}`);
    console.log(`   Risk Score: ${analysis.summary.riskScore}/100`);
    console.log(`   Processing Time: ${analysis.metadata.processingTime}ms`);
    console.log(`   Confidence: ${Math.round(analysis.metadata.confidence * 100)}%\n`);
    
    console.log('📋 CLAUSE BREAKDOWN:');
    analysis.clauseSummary.forEach(clauseType => {
      console.log(`   ${clauseType.displayName}: ${clauseType.count} (${clauseType.percentage}%)`);
    });
    
    console.log('\n🔍 EXTRACTED CLAUSES:');
    analysis.clauses.slice(0, 3).forEach((clause, index) => {
      console.log(`   ${index + 1}. ${clause.type.toUpperCase()}`);
      console.log(`      Text: "${clause.text.substring(0, 100)}..."`);
      console.log(`      Confidence: ${Math.round(clause.confidence * 100)}%\n`);
    });
    
    console.log('⚠️  IDENTIFIED RISKS:');
    analysis.risks.slice(0, 3).forEach((risk, index) => {
      console.log(`   ${index + 1}. ${risk.title} (${risk.severity})`);
      console.log(`      ${risk.description}\n`);
    });
    
    console.log('💡 RECOMMENDATIONS:');
    analysis.recommendations.slice(0, 2).forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.title} (${rec.priority} Priority)`);
      console.log(`      ${rec.description}\n`);
    });
    
    // Demonstrate health check
    console.log('🏥 System Health Check:');
    const health = await processor.healthCheck();
    console.log(`   Overall Status: ${health.status.toUpperCase()}`);
    console.log(`   Gemini API: ${health.components.gemini?.status || 'unknown'}`);
    console.log(`   AWS Services: ${health.components.aws?.status || 'unknown'}\n`);
    
    console.log('✨ Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error('\n💡 Make sure to set up your environment variables:');
    console.error('   - GEMINI_API_KEY');
    console.error('   - AWS_ACCESS_KEY_ID');
    console.error('   - AWS_SECRET_ACCESS_KEY');
    console.error('   - AWS_REGION');
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateClauseExtraction();
}

export { demonstrateClauseExtraction };