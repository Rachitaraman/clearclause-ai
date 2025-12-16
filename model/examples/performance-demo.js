// Performance optimization demo
// Demonstrates the enhanced contract processor with performance monitoring

import { ContractProcessorWithPerformance } from '../core/ContractProcessorWithPerformance.js';

/**
 * Demo script showing performance optimization features
 */
async function performanceDemo() {
  console.log('🚀 Starting Contract Processor Performance Demo\n');

  // Initialize contract processor with performance optimization
  const processor = new ContractProcessorWithPerformance({
    maxMemoryUsage: 8000, // 8GB limit for demo
    maxConcurrentRequests: 2, // Limit concurrent requests
    maxProcessingTime: 15000, // 15 second timeout
    enablePerformanceMonitoring: true,
    enableResourceManagement: true
  });

  try {
    // Initialize the processor
    console.log('📋 Initializing contract processor...');
    await processor.initialize();
    console.log('✅ Contract processor initialized\n');

    // Sample contract text for testing
    const sampleContract = `
      EMPLOYMENT AGREEMENT
      
      This Employment Agreement is entered into between Company ABC and John Doe.
      
      1. TERM: This agreement shall commence on January 1, 2024 and continue for a period of two years.
      
      2. COMPENSATION: Employee shall receive a base salary of $100,000 per year, payable monthly.
      
      3. TERMINATION: Either party may terminate this agreement with 30 days written notice.
      
      4. CONFIDENTIALITY: Employee agrees to maintain confidentiality of all proprietary information.
      
      5. NON-COMPETE: Employee agrees not to compete with Company for 12 months after termination.
      
      6. LIABILITY: Company's liability shall be limited to the amount of compensation paid.
    `;

    // Process multiple contracts concurrently to demonstrate queuing
    console.log('📄 Processing multiple contracts concurrently...');
    
    const processingPromises = [];
    for (let i = 1; i <= 5; i++) {
      const promise = processor.processContract(sampleContract, {
        extractClauses: true,
        assessRisks: true,
        generateRecommendations: true
      }).then(result => {
        console.log(`✅ Contract ${i} processed - Found ${result.clauses.length} clauses, ${result.risks.length} risks`);
        return result;
      }).catch(error => {
        console.log(`❌ Contract ${i} failed: ${error.message}`);
        return null;
      });
      
      processingPromises.push(promise);
    }

    // Wait for all processing to complete
    const results = await Promise.all(processingPromises);
    const successfulResults = results.filter(r => r !== null);
    
    console.log(`\n📊 Processing completed: ${successfulResults.length}/${results.length} successful\n`);

    // Display performance metrics
    console.log('📈 Performance Metrics:');
    const performanceMetrics = processor.getPerformanceMetrics();
    console.log(`   • Total Requests: ${performanceMetrics.totalRequests}`);
    console.log(`   • Success Rate: ${(performanceMetrics.successRate * 100).toFixed(1)}%`);
    console.log(`   • Average Response Time: ${performanceMetrics.averageResponseTime.toFixed(0)}ms`);
    console.log(`   • Throughput: ${performanceMetrics.throughput.toFixed(2)} requests/sec`);
    console.log(`   • Current Load: ${performanceMetrics.currentLoad} active requests`);
    console.log(`   • System Healthy: ${performanceMetrics.isHealthy ? '✅' : '❌'}\n`);

    // Display system status
    console.log('🔧 System Status:');
    const status = processor.getStatus();
    console.log(`   • Memory Usage: ${status.resourceStatus.memoryUsage.toFixed(0)}MB`);
    console.log(`   • Memory Utilization: ${(status.resourceStatus.memoryUtilization * 100).toFixed(1)}%`);
    console.log(`   • Queue Length: ${status.resourceStatus.queue.queued}`);
    console.log(`   • Processing: ${status.resourceStatus.queue.processing}`);
    console.log(`   • Completed: ${status.resourceStatus.queue.completed}`);
    console.log(`   • Failed: ${status.resourceStatus.queue.failed}`);
    console.log(`   • Degraded Mode: ${status.resourceStatus.isDegraded ? '⚠️' : '✅'}\n`);

    // Demonstrate resource optimization
    console.log('🔧 Triggering resource optimization...');
    await processor.optimizeResources();
    console.log('✅ Resource optimization completed\n');

    // Show final status
    const finalStatus = processor.getStatus();
    console.log('📊 Final System Status:');
    console.log(`   • Memory Usage: ${finalStatus.resourceStatus.memoryUsage.toFixed(0)}MB`);
    console.log(`   • System Healthy: ${finalStatus.isHealthy ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  } finally {
    // Cleanup
    console.log('\n🧹 Shutting down contract processor...');
    await processor.shutdown();
    console.log('✅ Demo completed successfully!');
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  performanceDemo().catch(console.error);
}

export { performanceDemo };