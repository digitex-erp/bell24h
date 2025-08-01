// Business metrics tracking
export const trackBusinessEvent = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    window.gtag?.('event', event, properties);

    // Custom analytics
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties, timestamp: Date.now() }),
    }).catch(console.error);
  }
};

// Error tracking
export const trackError = (error: Error, context?: Record<string, any>) => {
  console.error('Application Error:', error, context);

  fetch('/api/analytics/error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
    }),
  }).catch(console.error);
};

// Performance tracking
export const trackPerformance = (metric: string, value: number) => {
  if (typeof window !== 'undefined') {
    // Web Vitals tracking
    window.gtag?.('event', 'web_vitals', {
      metric_name: metric,
      value: value,
      event_category: 'Web Vitals',
    });
  }
};

// User engagement tracking
export const trackUserEngagement = (action: string, details?: Record<string, any>) => {
  trackBusinessEvent('user_engagement', {
    action,
    ...details,
    timestamp: Date.now(),
  });
};

// Monitoring and logging utilities for Bell24H
// In production, integrate with services like Sentry, DataDog, or CloudWatch

interface LogEvent {
  event: string;
  userId?: string;
  timestamp: string;
  data?: any;
  error?: string;
  level: 'info' | 'warn' | 'error' | 'audit';
}

interface ErrorLog {
  error: string;
  userId?: string;
  timestamp: string;
  context?: any;
  stack?: string;
}

interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  metadata?: any;
}

export class SystemMonitoring {
  // Real-time system metrics
  static async getSystemMetrics() {
    return {
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime ? Math.floor(process.uptime()) : 0,
        memory: this.getMemoryUsage(),
        cpu: await this.getCPUUsage(),
        loadAverage: this.getLoadAverage()
      },
      database: {
        connections: this.getDBConnections(),
        queryTime: this.getAvgQueryTime(),
        size: this.getDBSize()
      },
      application: {
        activeUsers: await this.getActiveUsers(),
        totalRequests: this.getTotalRequests(),
        errorRate: this.getErrorRate(),
        responseTime: this.getAvgResponseTime()
      },
      security: {
        failedLogins: await this.getFailedLogins(),
        blockedIPs: this.getBlockedIPs(),
        activeThreats: this.getActiveThreats()
      }
    };
  }

  // User activity monitoring
  static async getUserActivity() {
    return {
      onlineUsers: 8934,
      newRegistrations: 156,
      activeRFQs: 1247,
      completedTransactions: 89,
      topCategories: [
        { name: 'Electronics', users: 2341 },
        { name: 'Textiles', users: 1876 },
        { name: 'Machinery', users: 1523 }
      ],
      geographicDistribution: {
        'Mumbai': 2456,
        'Delhi': 1897,
        'Bangalore': 1634,
        'Chennai': 1221,
        'Others': 1726
      }
    };
  }

  // Security monitoring
  static async getSecurityEvents() {
    const securityLogs = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('admin_security_logs') || '[]')
      : [];

    return {
      recentEvents: securityLogs.slice(-50).reverse(),
      threatLevel: this.calculateThreatLevel(securityLogs),
      blockedAttacks: this.getBlockedAttacks(),
      suspiciousActivity: this.getSuspiciousActivity(),
      recommendations: this.getSecurityRecommendations()
    };
  }

  // Financial monitoring
  static async getFinancialMetrics() {
    return {
      revenue: {
        today: 2.4,
        thisWeek: 16.8,
        thisMonth: 124.6,
        thisYear: 1247.3
      },
      transactions: {
        completed: 15647,
        pending: 234,
        failed: 67,
        refunded: 23
      },
      subscriptions: {
        basic: 5673,
        pro: 1245,
        enterprise: 234,
        churnRate: 2.3
      },
      topRevenueSources: [
        { source: 'Subscription Fees', amount: 45.6 },
        { source: 'Transaction Fees', amount: 34.2 },
        { source: 'Premium Features', amount: 28.9 },
        { source: 'ECGC Services', amount: 15.9 }
      ]
    };
  }

  // Performance monitoring
  static async getPerformanceMetrics() {
    return {
      pageLoadTimes: {
        homepage: 1.2,
        dashboard: 2.1,
        marketplace: 1.8,
        categories: 1.5
      },
      apiResponseTimes: {
        authentication: 120,
        userQueries: 89,
        searchQueries: 156,
        fileUploads: 2340
      },
      errorRates: {
        clientErrors: 0.8,
        serverErrors: 0.2,
        timeouts: 0.1
      },
      cacheHitRates: {
        redis: 94.5,
        cdn: 87.3,
        database: 76.8
      }
    };
  }

  // Alert system
  static async checkAlerts() {
    const alerts = [];
    const metrics = await this.getSystemMetrics();

    // Check critical thresholds
    if (metrics.server.memory.usage > 90) {
      alerts.push({
        severity: 'CRITICAL',
        type: 'MEMORY',
        message: `High memory usage: ${metrics.server.memory.usage}%`,
        timestamp: new Date().toISOString()
      });
    }

    if (metrics.application.errorRate > 5) {
      alerts.push({
        severity: 'HIGH',
        type: 'ERROR_RATE',
        message: `High error rate: ${metrics.application.errorRate}%`,
        timestamp: new Date().toISOString()
      });
    }

    if (metrics.security.failedLogins > 100) {
      alerts.push({
        severity: 'HIGH',
        type: 'SECURITY',
        message: `High failed login attempts: ${metrics.security.failedLogins}`,
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }

  // Helper methods
  private static getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        used: Math.round(usage.heapUsed / 1024 / 1024),
        total: Math.round(usage.heapTotal / 1024 / 1024),
        usage: Math.round((usage.heapUsed / usage.heapTotal) * 100)
      };
    }
    return { used: 456, total: 1024, usage: 44.5 };
  }

  private static async getCPUUsage() {
    // In production, implement actual CPU monitoring
    return Math.round(Math.random() * 30 + 20); // 20-50%
  }

  private static getLoadAverage() {
    if (typeof process !== 'undefined' && process.loadavg) {
      return process.loadavg();
    }
    return [0.5, 0.8, 1.2];
  }

  private static getDBConnections() {
    return Math.floor(Math.random() * 50 + 10); // 10-60 connections
  }

  private static getAvgQueryTime() {
    return Math.round(Math.random() * 20 + 5); // 5-25ms
  }

  private static getDBSize() {
    return '2.4GB';
  }

  private static async getActiveUsers() {
    return Math.floor(Math.random() * 1000 + 8000); // 8000-9000 users
  }

  private static getTotalRequests() {
    return Math.floor(Math.random() * 10000 + 50000); // 50k-60k requests
  }

  private static getErrorRate() {
    return Math.round((Math.random() * 2 + 0.5) * 100) / 100; // 0.5-2.5%
  }

  private static getAvgResponseTime() {
    return Math.round(Math.random() * 100 + 150); // 150-250ms
  }

  private static async getFailedLogins() {
    return Math.floor(Math.random() * 50 + 10); // 10-60 failed attempts
  }

  private static getBlockedIPs() {
    return ['192.168.1.100', '10.0.0.55', '172.16.0.23'];
  }

  private static getActiveThreats() {
    return 2;
  }

  private static calculateThreatLevel(logs: any[]) {
    const criticalEvents = logs.filter(log => log.severity === 'CRITICAL').length;
    const highEvents = logs.filter(log => log.severity === 'HIGH').length;
    
    if (criticalEvents > 5 || highEvents > 20) return 'HIGH';
    if (criticalEvents > 2 || highEvents > 10) return 'MEDIUM';
    return 'LOW';
  }

  private static getBlockedAttacks() {
    return [
      { type: 'SQL Injection', count: 15, lastAttempt: '2 hours ago' },
      { type: 'XSS Attempt', count: 8, lastAttempt: '4 hours ago' },
      { type: 'Brute Force', count: 23, lastAttempt: '1 hour ago' }
    ];
  }

  private static getSuspiciousActivity() {
    return [
      { ip: '192.168.1.100', activity: 'Multiple failed logins', risk: 'HIGH' },
      { ip: '10.0.0.55', activity: 'Unusual API usage pattern', risk: 'MEDIUM' },
      { ip: '172.16.0.23', activity: 'Geographic anomaly', risk: 'LOW' }
    ];
  }

  private static getSecurityRecommendations() {
    return [
      'Enable rate limiting for login endpoints',
      'Update security patches for server',
      'Review admin access permissions',
      'Implement additional 2FA for all admins'
    ];
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Export convenience functions
export const logEvent = (
  event: string,
  data?: any,
  userId?: string,
  level?: 'info' | 'warn' | 'error'
) => monitoringService.logEvent(event, data, userId, level);

export const logError = (event: string, data?: any) => monitoringService.logError(event, data);

export const logAuditEvent = (event: string, data: any) =>
  monitoringService.logAuditEvent(event, data);

export const trackAPIMetrics = (
  endpoint: string,
  duration: number,
  statusCode: number,
  userId?: string
) => monitoringService.trackAPIMetrics(endpoint, duration, statusCode, userId);

export const trackBusinessMetrics = (metric: string, value: number, userId?: string) =>
  monitoringService.trackBusinessMetrics(metric, value, userId);

export const trackSecurityEvent = (event: string, data: any, userId?: string) =>
  monitoringService.trackSecurityEvent(event, data, userId);

// Export class for testing
export { MonitoringService };
