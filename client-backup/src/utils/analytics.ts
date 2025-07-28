interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

class Analytics {
  private static instance: Analytics;
  private events: AnalyticsEvent[] = [];
  private readonly maxEvents = 1000;
  private sessionId: string;
  private userId?: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
  }

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners() {
    // Track page views
    window.addEventListener('popstate', () => this.trackPageView());
    
    // Track clicks on interactive elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        this.trackEvent('interaction', 'click', target.textContent || target.getAttribute('href') || 'unknown');
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form', 'submit', form.id || form.name || 'unknown');
    });

    // Track input focus
    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        this.trackEvent('interaction', 'focus', target.id || target.name || 'unknown');
      }
    }, true);
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ) {
    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      properties,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.events.push(event);

    // Keep only the latest events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics event:', event);
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalyticsService(event);
    }
  }

  public trackPageView() {
    this.trackEvent('page', 'view', window.location.pathname);
  }

  public trackApiCall(endpoint: string, method: string, status: number, duration: number) {
    this.trackEvent('api', method.toLowerCase(), endpoint, duration, {
      status,
      endpoint,
    });
  }

  public trackError(error: Error | string, additionalInfo?: Record<string, any>) {
    this.trackEvent('error', 'occurred', error instanceof Error ? error.message : error, undefined, {
      stack: error instanceof Error ? error.stack : undefined,
      ...additionalInfo,
    });
  }

  public trackPerformance(metric: string, value: number) {
    this.trackEvent('performance', metric, undefined, value);
  }

  private async sendToAnalyticsService(event: AnalyticsEvent) {
    try {
      // TODO: Implement actual analytics service integration
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (e) {
      console.error('Failed to send event to analytics service:', e);
    }
  }

  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  public clearEvents() {
    this.events = [];
  }
}

export const analytics = Analytics.getInstance();

// Custom hook for analytics
export const useAnalytics = () => {
  const trackEvent = React.useCallback(
    (
      category: string,
      action: string,
      label?: string,
      value?: number,
      properties?: Record<string, any>
    ) => {
      analytics.trackEvent(category, action, label, value, properties);
    },
    []
  );

  return { trackEvent };
}; 