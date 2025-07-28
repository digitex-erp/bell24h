type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: any;
  context?: string;
  userId?: string;
  sessionId: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;
  private sessionId: string;
  private userId?: string;
  private context?: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public setContext(context: string) {
    this.context = context;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: Date.now(),
      data,
      context: this.context,
      userId: this.userId,
      sessionId: this.sessionId,
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry = this.createLogEntry(level, message, data);
    this.logs.push(entry);

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'debug' ? 'debug' : level;
      console[consoleMethod](
        `[${entry.context || 'App'}] ${message}`,
        data ? data : ''
      );
    }

    // Send to logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry);
    }
  }

  public debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  public info(message: string, data?: any) {
    this.log('info', message, data);
  }

  public warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  public error(message: string, data?: any) {
    this.log('error', message, data);
  }

  private async sendToLoggingService(entry: LogEntry) {
    try {
      // TODO: Implement actual logging service integration
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // });
    } catch (e) {
      console.error('Failed to send log to logging service:', e);
    }
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  public getLogsByContext(context: string): LogEntry[] {
    return this.logs.filter(log => log.context === context);
  }

  public clearLogs() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();

// Custom hook for logging
export const useLogger = (context?: string) => {
  const logContext = React.useMemo(() => context, [context]);

  const debug = React.useCallback(
    (message: string, data?: any) => {
      logger.debug(message, { ...data, context: logContext });
    },
    [logContext]
  );

  const info = React.useCallback(
    (message: string, data?: any) => {
      logger.info(message, { ...data, context: logContext });
    },
    [logContext]
  );

  const warn = React.useCallback(
    (message: string, data?: any) => {
      logger.warn(message, { ...data, context: logContext });
    },
    [logContext]
  );

  const error = React.useCallback(
    (message: string, data?: any) => {
      logger.error(message, { ...data, context: logContext });
    },
    [logContext]
  );

  return { debug, info, warn, error };
}; 