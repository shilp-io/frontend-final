// src/lib/services/base.ts

import { type Auth } from 'firebase/auth';
import { type FirebaseApp } from 'firebase/app';
import { firebaseService } from './firebase';

export interface ServiceConfig {
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    retryAttempts?: number;
    retryDelay?: number;
}

type LogLevel = NonNullable<ServiceConfig['logLevel']>;

export abstract class BaseService {
    protected abstract serviceName: string;
    protected config: Required<ServiceConfig>;

    protected constructor(config: ServiceConfig = {}) {
        this.config = {
            logLevel: 'info',
            retryAttempts: 3,
            retryDelay: 1000,
            ...config
        };
    }

    protected get firebaseApp(): FirebaseApp {
        return firebaseService.getApp();
    }

    protected get firebaseAuth(): Auth {
        return firebaseService.getAuth();
    }

    // Enhanced error handling with retry support
    protected async withErrorHandling<T>(
        operation: () => Promise<T>,
        options: { 
            retry?: boolean;
            customRetryAttempts?: number;
            customRetryDelay?: number;
        } = {}
    ): Promise<T> {
        const retryAttempts = options.customRetryAttempts ?? this.config.retryAttempts;
        const retryDelay = options.customRetryDelay ?? this.config.retryDelay;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= (options.retry ? retryAttempts : 1); attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                this.error(`Attempt ${attempt}/${retryAttempts} failed:`, lastError);

                if (attempt < retryAttempts && options.retry) {
                    await this.delay(retryDelay * attempt);
                    continue;
                }
                break;
            }
        }

        if (!lastError) {
            lastError = new Error('Unknown error occurred');
        }
        throw this.enhanceError(lastError);
    }

    // Enhanced logging with log levels
    protected log(message: string, data?: any): void {
        if (this.shouldLog('info')) {
            console.log(`[${this.serviceName}] ${message}`, data || '');
        }
    }

    protected debug(message: string, data?: any): void {
        if (this.shouldLog('debug')) {
            console.debug(`[${this.serviceName}] ${message}`, data || '');
        }
    }

    protected warn(message: string, data?: any): void {
        if (this.shouldLog('warn')) {
            console.warn(`[${this.serviceName}] ${message}`, data || '');
        }
    }

    protected error(message: string, data?: any): void {
        if (this.shouldLog('error')) {
            console.error(`[${this.serviceName}] ${message}`, data || '');
        }
    }

    // Utility methods
    protected enhanceError(error: Error): Error {
        const enhancedError = new Error(`[${this.serviceName}] ${error.message}`);
        enhancedError.stack = error.stack;
        return enhancedError;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: Record<LogLevel, number> = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        return levels[level] >= levels[this.config.logLevel];
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}