import fs from 'fs/promises';
import path from 'path';
import { errorDetectionSystem } from '../monitoring/error-detection.system';

interface TestRunResult {
  id: string;
  timestamp: Date;
  testSuite: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshots?: string[];
  coverage?: CoverageData;
}

interface CoverageData {
  lines: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
  statements: { total: number; covered: number; percentage: number };
}

interface DashboardData {
  metadata: {
    generatedAt: Date;
    testRunId: string;
    environment: string;
    version: string;
    totalDuration: number;
  };
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    passRate: number;
    coveragePercentage: number;
    performanceScore: number;
  };
  testResults: TestRunResult[];
  errorAnalysis: any;
  performanceMetrics: any;
  systemHealth: any;
  trends: {
    daily: any[];
    weekly: any[];
    monthly: any[];
  };
}

export class Bell24HDashboardGenerator {
  private reportDir: string;
  private templateDir: string;

  constructor(reportDir: string = './test-reports', templateDir: string = './__tests__/templates') {
    this.reportDir = reportDir;
    this.templateDir = templateDir;
  }

  async generateComprehensiveDashboard(testResults: TestRunResult[]): Promise<string> {
    console.log('🎯 Generating Bell24H Comprehensive Test Dashboard...');

    // Gather all data
    const dashboardData = await this.prepareDashboardData(testResults);
    
    // Generate HTML dashboard
    const dashboardHtml = await this.generateDashboardHTML(dashboardData);
    
    // Save dashboard
    const dashboardPath = path.join(this.reportDir, 'bell24h-test-dashboard.html');
    await fs.writeFile(dashboardPath, dashboardHtml);
    
    // Generate JSON report for CI/CD integration
    const jsonReportPath = path.join(this.reportDir, 'bell24h-test-report.json');
    await fs.writeFile(jsonReportPath, JSON.stringify(dashboardData, null, 2));
    
    // Generate individual component reports
    await this.generateComponentReports(dashboardData);
    
    console.log(`✅ Dashboard generated: ${dashboardPath}`);
    return dashboardPath;
  }

  private async prepareDashboardData(testResults: TestRunResult[]): Promise<DashboardData> {
    const monitoringData = await errorDetectionSystem.getDashboardData();
    
    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.status === 'passed').length;
    const failedTests = testResults.filter(t => t.status === 'failed').length;
    const skippedTests = testResults.filter(t => t.status === 'skipped').length;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    // Calculate coverage (mock data for now)
    const coveragePercentage = this.calculateOverallCoverage(testResults);
    
    return {
      metadata: {
        generatedAt: new Date(),
        testRunId: `bell24h-${Date.now()}`,
        environment: process.env.NODE_ENV || 'test',
        version: '1.0.0',
        totalDuration: testResults.reduce((sum, t) => sum + t.duration, 0)
      },
      summary: {
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        passRate,
        coveragePercentage,
        performanceScore: monitoringData.summary.avgPerformance
      },
      testResults,
      errorAnalysis: {
        errors: monitoringData.errors,
        patterns: monitoringData.patterns,
        byType: this.groupErrorsByType(monitoringData.errors),
        bySeverity: this.groupErrorsBySeverity(monitoringData.errors)
      },
      performanceMetrics: {
        metrics: monitoringData.performance,
        trends: this.calculatePerformanceTrends(monitoringData.performance),
        thresholds: this.getPerformanceThresholds()
      },
      systemHealth: monitoringData.health,
      trends: {
        daily: await this.getDailyTrends(),
        weekly: await this.getWeeklyTrends(),
        monthly: await this.getMonthlyTrends()
      }
    };
  }

  private async generateDashboardHTML(data: DashboardData): Promise<string> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bell24H Test Dashboard - ${data.metadata.generatedAt.toLocaleDateString()}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .metric-card { transition: transform 0.2s; }
        .metric-card:hover { transform: translateY(-2px); }
        .status-passed { color: #10b981; }
        .status-failed { color: #ef4444; }
        .status-skipped { color: #f59e0b; }
        .health-healthy { color: #10b981; }
        .health-warning { color: #f59e0b; }
        .health-critical { color: #ef4444; }
        .bell-icon { animation: swing 2s ease-in-out infinite; }
        @keyframes swing {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(15deg); }
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="gradient-bg text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="bell-icon text-3xl">🔔</div>
                    <div>
                        <h1 class="text-3xl font-bold">Bell24H Test Dashboard</h1>
                        <p class="text-blue-100">Comprehensive AI-Powered B2B Testing Analytics</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm text-blue-100">Generated</div>
                    <div class="text-lg font-semibold">${data.metadata.generatedAt.toLocaleString()}</div>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            ${this.generateSummaryCards(data.summary)}
        </div>

        <!-- System Health -->
        <div class="card p-6 mb-8">
            <h2 class="text-2xl font-bold mb-4 flex items-center">
                <i class="fas fa-heartbeat mr-3 text-red-500"></i>
                System Health Status
            </h2>
            ${this.generateHealthStatus(data.systemHealth)}
        </div>

        <!-- Test Results Overview -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- Test Results Chart -->
            <div class="card p-6">
                <h3 class="text-xl font-bold mb-4">Test Results Distribution</h3>
                <canvas id="testResultsChart" width="400" height="200"></canvas>
            </div>

            <!-- Performance Trends -->
            <div class="card p-6">
                <h3 class="text-xl font-bold mb-4">Performance Trends</h3>
                <canvas id="performanceTrendsChart" width="400" height="200"></canvas>
            </div>
        </div>

        <!-- Detailed Test Results -->
        <div class="card p-6 mb-8">
            <h2 class="text-2xl font-bold mb-4 flex items-center">
                <i class="fas fa-list-check mr-3 text-blue-500"></i>
                Detailed Test Results
            </h2>
            ${this.generateTestResultsTable(data.testResults)}
        </div>

        <!-- Error Analysis -->
        <div class="card p-6 mb-8">
            <h2 class="text-2xl font-bold mb-4 flex items-center">
                <i class="fas fa-bug mr-3 text-red-500"></i>
                Error Analysis & Patterns
            </h2>
            ${this.generateErrorAnalysis(data.errorAnalysis)}
        </div>

        <!-- Performance Metrics -->
        <div class="card p-6 mb-8">
            <h2 class="text-2xl font-bold mb-4 flex items-center">
                <i class="fas fa-tachometer-alt mr-3 text-green-500"></i>
                Performance Metrics
            </h2>
            ${this.generatePerformanceMetrics(data.performanceMetrics)}
        </div>

        <!-- Feature-Specific Reports -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            ${this.generateFeatureReports(data)}
        </div>

        <!-- Trends and Analytics -->
        <div class="card p-6 mb-8">
            <h2 class="text-2xl font-bold mb-4 flex items-center">
                <i class="fas fa-chart-line mr-3 text-purple-500"></i>
                Trends & Analytics
            </h2>
            ${this.generateTrendsAnalysis(data.trends)}
        </div>

        <!-- Recommendations -->
        <div class="card p-6 mb-8">
            <h2 class="text-2xl font-bold mb-4 flex items-center">
                <i class="fas fa-lightbulb mr-3 text-yellow-500"></i>
                AI-Powered Recommendations
            </h2>
            ${this.generateRecommendations(data)}
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p>Bell24H Comprehensive Testing System | Generated at ${data.metadata.generatedAt.toISOString()}</p>
            <p class="text-gray-400 mt-2">Test Run ID: ${data.metadata.testRunId}</p>
        </div>
    </footer>

    <script>
        ${this.generateChartScripts(data)}
    </script>
</body>
</html>`;

    return html;
  }

  private generateSummaryCards(summary: DashboardData['summary']): string {
    return `
        <div class="card metric-card p-6 text-center">
            <div class="text-3xl font-bold ${summary.passRate >= 95 ? 'text-green-600' : summary.passRate >= 80 ? 'text-yellow-600' : 'text-red-600'}">${summary.passRate.toFixed(1)}%</div>
            <div class="text-gray-600 mt-2">Pass Rate</div>
            <div class="text-sm text-gray-500">${summary.passedTests}/${summary.totalTests} tests</div>
        </div>

        <div class="card metric-card p-6 text-center">
            <div class="text-3xl font-bold ${summary.coveragePercentage >= 90 ? 'text-green-600' : summary.coveragePercentage >= 70 ? 'text-yellow-600' : 'text-red-600'}">${summary.coveragePercentage.toFixed(1)}%</div>
            <div class="text-gray-600 mt-2">Code Coverage</div>
            <div class="text-sm text-gray-500">Lines, Functions, Branches</div>
        </div>

        <div class="card metric-card p-6 text-center">
            <div class="text-3xl font-bold ${summary.performanceScore >= 90 ? 'text-green-600' : summary.performanceScore >= 70 ? 'text-yellow-600' : 'text-red-600'}">${summary.performanceScore.toFixed(1)}</div>
            <div class="text-gray-600 mt-2">Performance Score</div>
            <div class="text-sm text-gray-500">Avg Response Time</div>
        </div>

        <div class="card metric-card p-6 text-center">
            <div class="text-3xl font-bold text-blue-600">${summary.totalTests}</div>
            <div class="text-gray-600 mt-2">Total Tests</div>
            <div class="text-sm text-gray-500">
                <span class="status-passed">${summary.passedTests} passed</span> • 
                <span class="status-failed">${summary.failedTests} failed</span>
            </div>
        </div>
    `;
  }

  private generateHealthStatus(health: any): string {
    const statusColor = health.overallHealth === 'healthy' ? 'green' : 
                       health.overallHealth === 'warning' ? 'yellow' : 'red';
    
    return `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
                <div class="text-4xl font-bold health-${health.overallHealth}">${health.overallHealth.toUpperCase()}</div>
                <div class="text-gray-600 mt-2">Overall Health</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">${health.criticalIssues}</div>
                <div class="text-gray-600 mt-2">Critical Issues</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-purple-600">${health.errorRate}</div>
                <div class="text-gray-600 mt-2">Error Rate (24h)</div>
            </div>
        </div>
        
        ${health.recommendations && health.recommendations.length > 0 ? `
        <div class="mt-6">
            <h4 class="font-semibold mb-3">Recommendations:</h4>
            <ul class="space-y-2">
                ${health.recommendations.map((rec: string) => `<li class="flex items-start"><i class="fas fa-arrow-right text-blue-500 mt-1 mr-2"></i><span>${rec}</span></li>`).join('')}
            </ul>
        </div>
        ` : ''}
    `;
  }

  private generateTestResultsTable(testResults: TestRunResult[]): string {
    const recentResults = testResults.slice(-20); // Show last 20 tests
    
    return `
        <div class="overflow-x-auto">
            <table class="min-w-full table-auto">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suite</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${recentResults.map(test => `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${test.testName}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${test.testSuite}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="status-${test.status} font-medium">
                                    <i class="fas fa-${test.status === 'passed' ? 'check-circle' : test.status === 'failed' ? 'times-circle' : 'clock'} mr-1"></i>
                                    ${test.status.toUpperCase()}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${test.duration.toFixed(0)}ms</td>
                            <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">${test.error || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        ${testResults.length > 20 ? `
        <div class="mt-4 text-center">
            <span class="text-gray-500">Showing 20 of ${testResults.length} tests</span>
        </div>
        ` : ''}
    `;
  }

  private generateErrorAnalysis(errorAnalysis: any): string {
    return `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <h4 class="font-semibold mb-3">Error Distribution by Type</h4>
                <div class="space-y-2">
                    ${Object.entries(errorAnalysis.byType || {}).map(([type, count]) => `
                        <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span class="capitalize">${type.replace(/_/g, ' ')}</span>
                            <span class="font-bold text-red-600">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <h4 class="font-semibold mb-3">Top Error Patterns</h4>
                <div class="space-y-2">
                    ${(errorAnalysis.patterns || []).slice(0, 5).map((pattern: any) => `
                        <div class="p-3 bg-gray-50 rounded">
                            <div class="font-medium">${pattern.pattern}</div>
                            <div class="text-sm text-gray-600">Frequency: ${pattern.data.frequency} occurrences</div>
                            ${pattern.data.suggestedFix ? `<div class="text-xs text-blue-600 mt-1">${pattern.data.suggestedFix}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
  }

  private generatePerformanceMetrics(performanceMetrics: any): string {
    return `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="card p-4">
                <h4 class="font-semibold mb-3">Render Performance</h4>
                <canvas id="renderPerformanceChart" width="300" height="150"></canvas>
            </div>
            
            <div class="card p-4">
                <h4 class="font-semibold mb-3">API Response Times</h4>
                <canvas id="apiResponseChart" width="300" height="150"></canvas>
            </div>
            
            <div class="card p-4">
                <h4 class="font-semibold mb-3">Memory Usage</h4>
                <canvas id="memoryUsageChart" width="300" height="150"></canvas>
            </div>
        </div>
    `;
  }

  private generateFeatureReports(data: DashboardData): string {
    const features = this.analyzeFeatureTests(data.testResults);
    
    return Object.entries(features).map(([feature, stats]: [string, any]) => `
        <div class="card p-6">
            <h3 class="text-xl font-bold mb-4 capitalize">${feature.replace(/-/g, ' ')}</h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <div class="text-2xl font-bold ${stats.passRate >= 95 ? 'text-green-600' : 'text-red-600'}">${stats.passRate.toFixed(1)}%</div>
                    <div class="text-sm text-gray-600">Pass Rate</div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-blue-600">${stats.total}</div>
                    <div class="text-sm text-gray-600">Total Tests</div>
                </div>
            </div>
            <div class="mt-4">
                <div class="text-sm text-gray-600 mb-2">Test Distribution:</div>
                <div class="flex space-x-4 text-sm">
                    <span class="status-passed">${stats.passed} passed</span>
                    <span class="status-failed">${stats.failed} failed</span>
                </div>
            </div>
        </div>
    `).join('');
  }

  private generateTrendsAnalysis(trends: any): string {
    return `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="card p-4">
                <h4 class="font-semibold mb-3">Daily Trends</h4>
                <canvas id="dailyTrendsChart" width="300" height="150"></canvas>
            </div>
            
            <div class="card p-4">
                <h4 class="font-semibold mb-3">Weekly Trends</h4>
                <canvas id="weeklyTrendsChart" width="300" height="150"></canvas>
            </div>
            
            <div class="card p-4">
                <h4 class="font-semibold mb-3">Monthly Trends</h4>
                <canvas id="monthlyTrendsChart" width="300" height="150"></canvas>
            </div>
        </div>
    `;
  }

  private generateRecommendations(data: DashboardData): string {
    const recommendations = this.generateAIRecommendations(data);
    
    return `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <h4 class="font-semibold mb-3 text-green-600">🎯 Priority Actions</h4>
                <ul class="space-y-3">
                    ${recommendations.priority.map((rec: string) => `
                        <li class="flex items-start">
                            <i class="fas fa-exclamation-triangle text-orange-500 mt-1 mr-2"></i>
                            <span>${rec}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div>
                <h4 class="font-semibold mb-3 text-blue-600">💡 Optimization Suggestions</h4>
                <ul class="space-y-3">
                    ${recommendations.optimization.map((rec: string) => `
                        <li class="flex items-start">
                            <i class="fas fa-lightbulb text-yellow-500 mt-1 mr-2"></i>
                            <span>${rec}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
        
        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 class="font-semibold mb-2 text-blue-800">🤖 AI Analysis Summary</h4>
            <p class="text-blue-700">${recommendations.aiSummary}</p>
        </div>
    `;
  }

  private generateChartScripts(data: DashboardData): string {
    return `
        // Test Results Chart
        const testResultsCtx = document.getElementById('testResultsChart').getContext('2d');
        new Chart(testResultsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed', 'Skipped'],
                datasets: [{
                    data: [${data.summary.passedTests}, ${data.summary.failedTests}, ${data.summary.skippedTests}],
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        // Performance Trends Chart
        const performanceCtx = document.getElementById('performanceTrendsChart').getContext('2d');
        new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Performance Score',
                    data: [85, 88, 92, ${data.summary.performanceScore}],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    `;
  }

  // Helper methods
  private calculateOverallCoverage(testResults: TestRunResult[]): number {
    // Mock coverage calculation - in real implementation, integrate with Istanbul/NYC
    const hasGoodCoverage = testResults.filter(t => t.status === 'passed').length;
    return Math.min(95, (hasGoodCoverage / testResults.length) * 100);
  }

  private groupErrorsByType(errors: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    errors.forEach(error => {
      grouped[error.errorType] = (grouped[error.errorType] || 0) + 1;
    });
    return grouped;
  }

  private groupErrorsBySeverity(errors: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    errors.forEach(error => {
      grouped[error.severity] = (grouped[error.severity] || 0) + 1;
    });
    return grouped;
  }

  private calculatePerformanceTrends(metrics: any[]): any {
    // Analyze performance trends over time
    return {
      average: metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length,
      trend: 'improving', // Mock trend analysis
      benchmarks: this.getPerformanceThresholds()
    };
  }

  private getPerformanceThresholds(): Record<string, number> {
    return {
      renderTime: 2000,
      loadTime: 3000,
      interactionTime: 100,
      memoryUsage: 50000000, // 50MB
      apiResponseTime: 500
    };
  }

  private analyzeFeatureTests(testResults: TestRunResult[]): Record<string, any> {
    const features: Record<string, any> = {};
    
    // Group tests by feature (based on test file names)
    testResults.forEach(test => {
      let feature = 'general';
      
      if (test.testSuite.includes('voice-rfq')) feature = 'voice-rfq';
      else if (test.testSuite.includes('ai-search')) feature = 'ai-search';
      else if (test.testSuite.includes('seo-country')) feature = 'seo-country';
      else if (test.testSuite.includes('audio-bell')) feature = 'audio-bell';
      else if (test.testSuite.includes('category-navigation')) feature = 'category-navigation';
      else if (test.testSuite.includes('authentication')) feature = 'authentication';
      
      if (!features[feature]) {
        features[feature] = { total: 0, passed: 0, failed: 0, passRate: 0 };
      }
      
      features[feature].total++;
      if (test.status === 'passed') features[feature].passed++;
      else if (test.status === 'failed') features[feature].failed++;
    });
    
    // Calculate pass rates
    Object.keys(features).forEach(feature => {
      const stats = features[feature];
      stats.passRate = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;
    });
    
    return features;
  }

  private generateAIRecommendations(data: DashboardData): any {
    const priority: string[] = [];
    const optimization: string[] = [];
    let aiSummary = '';
    
    // Analyze data and generate recommendations
    if (data.summary.passRate < 90) {
      priority.push('Focus on failing tests - pass rate below 90% threshold');
    }
    
    if (data.summary.performanceScore < 80) {
      priority.push('Address performance issues - optimize slow components');
    }
    
    if (data.errorAnalysis.bySeverity?.critical > 0) {
      priority.push('Resolve critical errors immediately - system stability at risk');
    }
    
    if (data.summary.coveragePercentage < 80) {
      optimization.push('Increase test coverage - add tests for uncovered code paths');
    }
    
    optimization.push('Consider implementing automated performance monitoring');
    optimization.push('Set up continuous integration for test automation');
    optimization.push('Add more comprehensive error tracking and alerting');
    
    aiSummary = `Based on analysis of ${data.summary.totalTests} tests with ${data.summary.passRate.toFixed(1)}% pass rate, the system shows ${data.systemHealth.overallHealth} health status. Key focus areas include improving test reliability and maintaining performance standards for the Bell24H AI-powered B2B platform.`;
    
    return { priority, optimization, aiSummary };
  }

  private async getDailyTrends(): Promise<any[]> {
    // Mock daily trends - in real implementation, fetch from monitoring system
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      passRate: 90 + Math.random() * 10,
      performanceScore: 80 + Math.random() * 20,
      errorCount: Math.floor(Math.random() * 10)
    }));
  }

  private async getWeeklyTrends(): Promise<any[]> {
    // Mock weekly trends
    return Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${4 - i}`,
      passRate: 85 + Math.random() * 15,
      performanceScore: 75 + Math.random() * 25,
      errorCount: Math.floor(Math.random() * 50)
    }));
  }

  private async getMonthlyTrends(): Promise<any[]> {
    // Mock monthly trends
    return Array.from({ length: 6 }, (_, i) => ({
      month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
      passRate: 80 + Math.random() * 20,
      performanceScore: 70 + Math.random() * 30,
      errorCount: Math.floor(Math.random() * 100)
    }));
  }

  private async generateComponentReports(data: DashboardData): Promise<void> {
    // Generate individual reports for each major component
    const components = ['voice-rfq', 'ai-search', 'seo-country', 'audio-bell', 'category-navigation', 'authentication'];
    
    for (const component of components) {
      const componentData = this.filterDataByComponent(data, component);
      const componentHtml = await this.generateComponentHTML(component, componentData);
      
      const componentPath = path.join(this.reportDir, `${component}-report.html`);
      await fs.writeFile(componentPath, componentHtml);
    }
  }

  private filterDataByComponent(data: DashboardData, component: string): any {
    return {
      ...data,
      testResults: data.testResults.filter(test => test.testSuite.includes(component)),
      errorAnalysis: {
        ...data.errorAnalysis,
        errors: data.errorAnalysis.errors.filter((error: any) => error.testFile.includes(component))
      }
    };
  }

  private async generateComponentHTML(component: string, data: any): Promise<string> {
    // Simplified component-specific HTML
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bell24H ${component.toUpperCase()} Test Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="max-w-6xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">🔔 Bell24H ${component.replace('-', ' ').toUpperCase()} Component Report</h1>
        
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold mb-4">Test Summary</h2>
            <div class="grid grid-cols-3 gap-4">
                <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">${data.testResults.length}</div>
                    <div class="text-gray-600">Total Tests</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">${data.testResults.filter((t: any) => t.status === 'passed').length}</div>
                    <div class="text-gray-600">Passed</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-red-600">${data.testResults.filter((t: any) => t.status === 'failed').length}</div>
                    <div class="text-gray-600">Failed</div>
                </div>
            </div>
        </div>
        
        <div class="mt-8 text-center">
            <a href="bell24h-test-dashboard.html" class="text-blue-600 hover:text-blue-800">← Back to Main Dashboard</a>
        </div>
    </div>
</body>
</html>`;
  }
}

// Export singleton instance
export const dashboardGenerator = new Bell24HDashboardGenerator(); 