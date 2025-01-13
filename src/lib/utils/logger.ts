// src/lib/utils/logger.ts

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

interface LogContext {
    [key: string]: unknown;
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context: LogContext;
}

class Logger {
    private readonly level: LogLevel;
    private readonly isDevelopment: boolean;

    constructor(level: LogLevel = 'info') {
        // Validate log level
        if (!LOG_LEVELS.includes(level)) {
            console.warn(`Invalid log level "${level}", defaulting to "info"`);
            this.level = 'info';
        } else {
            this.level = level;
        }

        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    private shouldLog(level: LogLevel): boolean {
        return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(this.level);
    }

    private formatLogEntry(
        level: LogLevel,
        message: string,
        context: LogContext,
    ): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
        };
    }

    private log(
        level: LogLevel,
        message: string,
        context: LogContext = {},
    ): void {
        if (!this.shouldLog(level)) return;

        const entry = this.formatLogEntry(level, message, context);

        // In development, log with more details
        if (this.isDevelopment) {
            const logFn = console[level] || console.log;
            logFn(
                `[${entry.timestamp}] [${level.toUpperCase()}] ${message}`,
                context,
            );
            return;
        }

        // In production, use structured logging for better parsing
        switch (level) {
            case 'debug':
                // Skip debug logs in production
                break;
            case 'info':
                console.log(JSON.stringify(entry));
                break;
            case 'warn':
                console.warn(JSON.stringify(entry));
                break;
            case 'error':
                console.error(JSON.stringify(entry));
                break;
        }
    }

    debug(message: string, context: LogContext = {}): void {
        this.log('debug', message, context);
    }

    info(message: string, context: LogContext = {}): void {
        this.log('info', message, context);
    }

    warn(message: string, context: LogContext = {}): void {
        this.log('warn', message, context);
    }

    error(message: string, context: LogContext = {}): void {
        this.log('error', message, context);
    }
}

// Environment validation
const validateLogLevel = (level: string | undefined): LogLevel => {
    if (!level || !LOG_LEVELS.includes(level as LogLevel)) {
        return 'info';
    }
    return level as LogLevel;
};

// Singleton instance with environment-aware configuration
export const logger = new Logger(
    validateLogLevel(process.env.NEXT_PUBLIC_LOG_LEVEL),
);

// Export types for consumers
export type { LogLevel, LogContext, LogEntry };
