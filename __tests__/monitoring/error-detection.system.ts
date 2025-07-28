import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';

// Types for error tracking and monitoring
interface TestError {
  id: string;
  timestamp: Date;
  testFile: string;
  testName: string;
  errorType: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  metadata: Record<string, any>;
  resolution?: ErrorResolution;
}

interface PerformanceMetric {
  id: string;
  timestamp: Date;
  testFile: string;
  testName: string;
  metricType: PerformanceMetricType;
  value: number;
  threshold: number;
  passed: boolean;
  metadata: Record<string, any>;
}

interface TestFailurePattern {
  pattern: string;
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
  affectedTests: string[];
  suggestedFix?: string;
}

interface SystemHealth {
  timestamp: Date;
  overallHealth: HealthStatus;
  testPassRate: number;
  performanceScore: number;
  errorRate: number;
  criticalIssues: number;
  recommendations: string[];
}

enum ErrorType {
  ASSERTION_FAILURE = 'assertion_failure',
  TIMEOUT = 'timeout',
  NETWORK_ERROR = 'network_error',
  DOM_ERROR = 'dom_error',
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  MEMORY_LEAK = 'memory_leak',
  SECURITY_VULNERABILITY = 'security_vulnerability',
  ACCESSIBILITY_VIOLATION = 'accessibility_violation',
  SEO_ISSUE = 'seo_issue',
  BROWSER_COMPATIBILITY = 'browser_compatibility'
}

enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

enum PerformanceMetricType {
  RENDER_TIME = 'render_time',
  LOAD_TIME = 'load_time',
  INTERACTION_TIME = 'interaction_time',
  MEMORY_USAGE = 'memory_usage',
  BUNDLE_SIZE = 'bundle_size',
  API_RESPONSE_TIME = 'api_response_time',
  LIGHTHOUSE_SCORE = 'lighthouse_score'
}

enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  FAILING = 'failing'
}

interface ErrorResolution {
  status: 'resolved' | 'investigating' | 'wont_fix' | 'duplicate';
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
  preventionSteps?: string[];
}

export class Bell24HErrorDetectionSystem {
  private errors: TestError[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private failurePatterns: Map<string, TestFailurePattern> = new Map();
  private systemHealth: SystemHealth[] = [];
  private reportDir: string;
  private startTime: number;

  constructor(reportDir: string = './test-reports') {
    this.reportDir = reportDir;
    this.startTime = performance.now();
    this.initializeMonitoring();
  }

  private async initializeMonitoring(): Promise<void> {
    try {
      await fs.mkdir(this.reportDir, { recursive: true });
      await fs.mkdir(path.join(this.reportDir, 'errors'), { recursive: true });
      await fs.mkdir(path.join(this.reportDir, 'performance'), { recursive: true });
      await fs.mkdir(path.join(this.reportDir, 'health'), { recursive: true });
      
      console.log('✅ Bell24H Error Detection System initialized');
    } catch (error) {
      console.error('❌ Failed to initialize error detection system:', error);
    }
  }

  // Error Detection and Tracking
  async captureTestError(
    testFile: string,
    testName: string,
    error: Error,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const testError: TestError = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      testFile,
      testName,
      errorType: this.classifyError(error),
      severity: this.calculateSeverity(error, metadata),
      message: error.message,
      stack: error.stack,
      metadata,
    };

    this.errors.push(testError);
    await this.updateFailurePatterns(testError);
    await this.saveErrorReport(testError);

    // Immediate alerts for critical errors
    if (testError.severity === ErrorSeverity.CRITICAL) {
      await this.sendCriticalAlert(testError);
    }
  }

  private classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // AI-powered error classification for Bell24H specific issues
    if (message.includes('timeout') || message.includes('timed out')) {
      return ErrorType.TIMEOUT;
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('xhr')) {
      return ErrorType.NETWORK_ERROR;
    }
    
    if (message.includes('document') || message.includes('element') || message.includes('dom')) {
      return ErrorType.DOM_ERROR;
    }
    
    if (message.includes('expect') || message.includes('assertion') || message.includes('toBe')) {
      return ErrorType.ASSERTION_FAILURE;
    }
    
    if (message.includes('memory') || stack.includes('heap')) {
      return ErrorType.MEMORY_LEAK;
    }
    
    if (message.includes('accessibility') || message.includes('aria') || message.includes('a11y')) {
      return ErrorType.ACCESSIBILITY_VIOLATION;
    }
    
    if (message.includes('seo') || message.includes('meta') || message.includes('schema')) {
      return ErrorType.SEO_ISSUE;
    }
    
    if (message.includes('permission') || message.includes('security') || message.includes('xss')) {
      return ErrorType.SECURITY_VULNERABILITY;
    }

    return ErrorType.ASSERTION_FAILURE; // Default fallback
  }

  private calculateSeverity(error: Error, metadata: Record<string, any>): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    // Critical: Core Bell24H features failing
    if (
      message.includes('voice rfq') ||
      message.includes('ai matching') ||
      message.includes('payment') ||
      message.includes('authentication') ||
      metadata.isCriticalPath
    ) {
      return ErrorSeverity.CRITICAL;
    }
    
    // High: Important functionality
    if (
      message.includes('search') ||
      message.includes('category') ||
      message.includes('supplier') ||
      message.includes('navigation') ||
      metadata.isHighPriority
    ) {
      return ErrorSeverity.HIGH;
    }
    
    // Medium: Secondary features
    if (
      message.includes('bell sound') ||
      message.includes('animation') ||
      message.includes('styling') ||
      message.includes('responsive')
    ) {
      return ErrorSeverity.MEDIUM;
    }
    
    // Low: Minor issues
    if (
      message.includes('tooltip') ||
      message.includes('hover') ||
      message.includes('transition')
    ) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM; // Default
  }

  // Performance Monitoring
  async trackPerformanceMetric(
    testFile: string,
    testName: string,
    metricType: PerformanceMetricType,
    value: number,
    threshold: number,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: new Date(),
      testFile,
      testName,
      metricType,
      value,
      threshold,
      passed: value <= threshold,
      metadata,
    };

    this.performanceMetrics.push(metric);

    // Alert for performance degradation
    if (!metric.passed) {
      await this.captureTestError(
        testFile,
        testName,
        new Error(`Performance threshold exceeded: ${metricType} = ${value}ms (threshold: ${threshold}ms)`),
        { ...metadata, performanceMetric: metric }
      );
    }

    await this.savePerformanceReport(metric);
  }

  // Failure Pattern Analysis
  private async updateFailurePatterns(error: TestError): Promise<void> {
    const pattern = this.extractPattern(error);
    
    if (this.failurePatterns.has(pattern)) {
      const existing = this.failurePatterns.get(pattern)!;
      existing.frequency++;
      existing.lastSeen = new Date();
      existing.affectedTests.push(`${error.testFile}:${error.testName}`);
    } else {
      this.failurePatterns.set(pattern, {
        pattern,
        frequency: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        affectedTests: [`${error.testFile}:${error.testName}`],
        suggestedFix: this.generateSuggestedFix(error)
      });
    }
  }

  private extractPattern(error: TestError): string {
    // Extract meaningful patterns from errors for Bell24H
    const message = error.message.toLowerCase();
    
    if (message.includes('voice rfq')) {
      return 'voice-rfq-functionality';
    }
    if (message.includes('ai search') || message.includes('search')) {
      return 'search-functionality';
    }
    if (message.includes('bell sound') || message.includes('audio')) {
      return 'audio-system';
    }
    if (message.includes('category') || message.includes('navigation')) {
      return 'navigation-system';
    }
    if (message.includes('seo') || message.includes('meta')) {
      return 'seo-optimization';
    }
    if (message.includes('authentication') || message.includes('login')) {
      return 'authentication-flow';
    }
    
    return `${error.errorType}-${error.testFile.split('/').pop()?.replace('.test.tsx', '')}`;
  }

  private generateSuggestedFix(error: TestError): string {
    const message = error.message.toLowerCase();
    
    // Bell24H specific fix suggestions
    if (message.includes('voice rfq')) {
      return 'Check MediaRecorder API availability and microphone permissions. Verify audio transcription service integration.';
    }
    
    if (message.includes('ai search') || message.includes('search')) {
      return 'Verify search API endpoints are accessible. Check search input validation and category filtering logic.';
    }
    
    if (message.includes('bell sound') || message.includes('audio')) {
      return 'Ensure audio files are properly loaded. Check Web Audio API support and user interaction requirements.';
    }
    
    if (message.includes('country') || message.includes('seo')) {
      return 'Verify GlobalSEOManager initialization and country configuration data. Check meta tag generation.';
    }
    
    if (message.includes('timeout')) {
      return 'Increase test timeout values. Check for asynchronous operations that may need additional wait time.';
    }
    
    if (message.includes('element') || message.includes('not found')) {
      return 'Verify component rendering timing. Add proper waitFor conditions or increase wait timeouts.';
    }

    return 'Review error context and check component dependencies. Ensure all required props and mocks are provided.';
  }

  // System Health Monitoring
  async calculateSystemHealth(): Promise<SystemHealth> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentErrors = this.errors.filter(e => e.timestamp > last24Hours);
    const recentMetrics = this.performanceMetrics.filter(m => m.timestamp > last24Hours);
    
    const totalTests = this.getTotalTestCount();
    const passedTests = totalTests - recentErrors.length;
    const testPassRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 100;
    
    const performanceScore = this.calculatePerformanceScore(recentMetrics);
    const errorRate = recentErrors.length;
    const criticalIssues = recentErrors.filter(e => e.severity === ErrorSeverity.CRITICAL).length;
    
    const health: SystemHealth = {
      timestamp: now,
      overallHealth: this.determineOverallHealth(testPassRate, performanceScore, criticalIssues),
      testPassRate,
      performanceScore,
      errorRate,
      criticalIssues,
      recommendations: this.generateRecommendations(recentErrors, recentMetrics)
    };

    this.systemHealth.push(health);
    await this.saveHealthReport(health);
    
    return health;
  }

  private determineOverallHealth(passRate: number, perfScore: number, criticalIssues: number): HealthStatus {
    if (criticalIssues > 0 || passRate < 80) {
      return HealthStatus.CRITICAL;
    }
    if (passRate < 95 || perfScore < 70) {
      return HealthStatus.WARNING;
    }
    if (passRate < 98 || perfScore < 85) {
      return HealthStatus.WARNING;
    }
    return HealthStatus.HEALTHY;
  }

  private calculatePerformanceScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 100;
    
    const passedMetrics = metrics.filter(m => m.passed).length;
    return (passedMetrics / metrics.length) * 100;
  }

  private generateRecommendations(errors: TestError[], metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = [];
    
    // Bell24H specific recommendations
    const voiceRfqErrors = errors.filter(e => e.message.toLowerCase().includes('voice rfq'));
    if (voiceRfqErrors.length > 0) {
      recommendations.push('Voice RFQ system requires attention. Check microphone permissions and audio processing pipeline.');
    }
    
    const searchErrors = errors.filter(e => e.message.toLowerCase().includes('search'));
    if (searchErrors.length > 0) {
      recommendations.push('AI-powered search functionality needs review. Verify search API integration and category filtering.');
    }
    
    const seoErrors = errors.filter(e => e.errorType === ErrorType.SEO_ISSUE);
    if (seoErrors.length > 0) {
      recommendations.push('SEO optimization issues detected. Review meta tags, structured data, and country-specific configurations.');
    }
    
    const performanceIssues = metrics.filter(m => !m.passed);
    if (performanceIssues.length > 0) {
      recommendations.push('Performance degradation detected. Consider optimizing component rendering and bundle size.');
    }
    
    const accessibilityErrors = errors.filter(e => e.errorType === ErrorType.ACCESSIBILITY_VIOLATION);
    if (accessibilityErrors.length > 0) {
      recommendations.push('Accessibility violations found. Ensure proper ARIA labels and keyboard navigation support.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System is performing well. Continue monitoring for emerging issues.');
    }
    
    return recommendations;
  }

  // Report Generation and Persistence
  private async saveErrorReport(error: TestError): Promise<void> {
    try {
      const filename = `error-${error.id}.json`;
      const filepath = path.join(this.reportDir, 'errors', filename);
      await fs.writeFile(filepath, JSON.stringify(error, null, 2));
    } catch (err) {
      console.error('Failed to save error report:', err);
    }
  }

  private async savePerformanceReport(metric: PerformanceMetric): Promise<void> {
    try {
      const filename = `perf-${metric.id}.json`;
      const filepath = path.join(this.reportDir, 'performance', filename);
      await fs.writeFile(filepath, JSON.stringify(metric, null, 2));
    } catch (err) {
      console.error('Failed to save performance report:', err);
    }
  }

  private async saveHealthReport(health: SystemHealth): Promise<void> {
    try {
      const filename = `health-${health.timestamp.toISOString().split('T')[0]}.json`;
      const filepath = path.join(this.reportDir, 'health', filename);
      await fs.writeFile(filepath, JSON.stringify(health, null, 2));
    } catch (err) {
      console.error('Failed to save health report:', err);
    }
  }

  // Alert System
  private async sendCriticalAlert(error: TestError): Promise<void> {
    const alert = {
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL',
      component: 'Bell24H Testing System',
      title: `Critical Test Failure: ${error.testName}`,
      description: error.message,
      testFile: error.testFile,
      errorType: error.errorType,
      suggestedAction: this.generateSuggestedFix(error)
    };

    console.error('🚨 CRITICAL ALERT:', JSON.stringify(alert, null, 2));
    
    // In production, integrate with alerting systems (Slack, email, PagerDuty, etc.)
    await this.saveAlertToFile(alert);
  }

  private async saveAlertToFile(alert: any): Promise<void> {
    try {
      const filename = `critical-alert-${Date.now()}.json`;
      const filepath = path.join(this.reportDir, filename);
      await fs.writeFile(filepath, JSON.stringify(alert, null, 2));
    } catch (err) {
      console.error('Failed to save critical alert:', err);
    }
  }

  // Analytics and Insights
  generateFailurePatternReport(): { pattern: string; data: TestFailurePattern }[] {
    return Array.from(this.failurePatterns.entries())
      .map(([pattern, data]) => ({ pattern, data }))
      .sort((a, b) => b.data.frequency - a.data.frequency);
  }

  getPerformanceTrends(hours: number = 24): PerformanceMetric[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.performanceMetrics.filter(m => m.timestamp > cutoff);
  }

  getErrorsByType(): Record<ErrorType, number> {
    const counts: Record<ErrorType, number> = {} as Record<ErrorType, number>;
    
    Object.values(ErrorType).forEach(type => {
      counts[type] = 0;
    });
    
    this.errors.forEach(error => {
      counts[error.errorType]++;
    });
    
    return counts;
  }

  getErrorsBySeverity(): Record<ErrorSeverity, number> {
    const counts: Record<ErrorSeverity, number> = {} as Record<ErrorSeverity, number>;
    
    Object.values(ErrorSeverity).forEach(severity => {
      counts[severity] = 0;
    });
    
    this.errors.forEach(error => {
      counts[error.severity]++;
    });
    
    return counts;
  }

  // Utility Methods
  private generateErrorId(): string {
    return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMetricId(): string {
    return `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTotalTestCount(): number {
    // In a real implementation, this would track actual test runs
    // For now, estimate based on error tracking
    return Math.max(100, this.errors.length * 2); // Assume 50% test failure rate
  }

  // Export Methods for Integration
  async exportErrorData(): Promise<TestError[]> {
    return [...this.errors];
  }

  async exportPerformanceData(): Promise<PerformanceMetric[]> {
    return [...this.performanceMetrics];
  }

  async exportSystemHealthData(): Promise<SystemHealth[]> {
    return [...this.systemHealth];
  }

  // Cleanup and Maintenance
  async cleanup(daysToKeep: number = 30): Promise<void> {
    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    this.errors = this.errors.filter(e => e.timestamp > cutoff);
    this.performanceMetrics = this.performanceMetrics.filter(m => m.timestamp > cutoff);
    this.systemHealth = this.systemHealth.filter(h => h.timestamp > cutoff);
    
    console.log(`🧹 Cleaned up monitoring data older than ${daysToKeep} days`);
  }

  // Integration Hooks for Test Frameworks
  async onTestStart(testFile: string, testName: string): Promise<void> {
    // Hook for test start - can be used for timing
    console.log(`▶️  Starting test: ${testFile}:${testName}`);
  }

  async onTestPass(testFile: string, testName: string, duration: number): Promise<void> {
    // Track successful test completion
    await this.trackPerformanceMetric(
      testFile,
      testName,
      PerformanceMetricType.RENDER_TIME,
      duration,
      5000, // 5 second threshold
      { status: 'passed' }
    );
  }

  async onTestFail(testFile: string, testName: string, error: Error, duration: number): Promise<void> {
    // Capture test failure
    await this.captureTestError(testFile, testName, error, { 
      duration,
      status: 'failed'
    });
  }

  // Real-time Monitoring Dashboard Data
  async getDashboardData(): Promise<{
    errors: TestError[];
    performance: PerformanceMetric[];
    health: SystemHealth;
    patterns: { pattern: string; data: TestFailurePattern }[];
    summary: {
      totalErrors: number;
      criticalErrors: number;
      passRate: number;
      avgPerformance: number;
    };
  }> {
    const currentHealth = await this.calculateSystemHealth();
    const patterns = this.generateFailurePatternReport();
    
    const criticalErrors = this.errors.filter(e => e.severity === ErrorSeverity.CRITICAL).length;
    const avgPerformance = this.calculatePerformanceScore(this.performanceMetrics);
    
    return {
      errors: this.errors.slice(-50), // Last 50 errors
      performance: this.performanceMetrics.slice(-50), // Last 50 metrics
      health: currentHealth,
      patterns: patterns.slice(0, 10), // Top 10 patterns
      summary: {
        totalErrors: this.errors.length,
        criticalErrors,
        passRate: currentHealth.testPassRate,
        avgPerformance
      }
    };
  }
}

// Export singleton instance for global use
export const errorDetectionSystem = new Bell24HErrorDetectionSystem(); 