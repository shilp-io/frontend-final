// src/lib/utils/result.ts

export type Success<T> = {
    readonly isSuccess: true;
    readonly value: T;
};

export type Failure<E> = {
    readonly isSuccess: false;
    readonly error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

export class ResultError extends Error {
    constructor(
        message: string,
        public readonly cause?: unknown,
    ) {
        super(message);
        this.name = 'ResultError';
    }
}

export const Result = {
    success<T>(value: T): Success<T> {
        return Object.freeze({ isSuccess: true, value });
    },

    failure<E>(error: E): Failure<E> {
        return Object.freeze({ isSuccess: false, error });
    },

    isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
        return result.isSuccess;
    },

    isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
        return !result.isSuccess;
    },

    unwrap<T, E>(result: Result<T, E>): T {
        if (result.isSuccess) {
            return result.value;
        }
        if (result.error instanceof Error) {
            throw result.error;
        }
        throw new ResultError('Failed to unwrap result', result.error);
    },

    unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
        return result.isSuccess ? result.value : defaultValue;
    },

    unwrapOrElse<T, E>(result: Result<T, E>, fn: (error: E) => T): T {
        return result.isSuccess ? result.value : fn(result.error);
    },

    map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
        if (result.isSuccess) {
            try {
                return Result.success(fn(result.value));
            } catch (error) {
                return Result.failure(error as E);
            }
        }
        return result;
    },

    mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
        if (result.isSuccess) {
            return result;
        }
        return Result.failure(fn(result.error));
    },

    flatMap<T, U, E>(
        result: Result<T, E>,
        fn: (value: T) => Result<U, E>,
    ): Result<U, E> {
        if (result.isSuccess) {
            try {
                return fn(result.value);
            } catch (error) {
                return Result.failure(error as E);
            }
        }
        return result;
    },

    tap<T, E>(result: Result<T, E>, fn: (value: T) => void): Result<T, E> {
        if (result.isSuccess) {
            try {
                fn(result.value);
            } catch (error) {
                console.error('Error in Result.tap:', error);
            }
        }
        return result;
    },

    tapError<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E> {
        if (!result.isSuccess) {
            try {
                fn(result.error);
            } catch (error) {
                console.error('Error in Result.tapError:', error);
            }
        }
        return result;
    },

    from<T>(fn: () => T): Result<T, Error> {
        try {
            return Result.success(fn());
        } catch (error) {
            return Result.failure(
                error instanceof Error ? error : new ResultError(String(error)),
            );
        }
    },

    async fromAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
        try {
            return Result.success(await fn());
        } catch (error) {
            return Result.failure(
                error instanceof Error ? error : new ResultError(String(error)),
            );
        }
    },

    all<T, E>(results: Result<T, E>[]): Result<T[], E> {
        const values: T[] = [];
        for (const result of results) {
            if (!result.isSuccess) {
                return result;
            }
            values.push(result.value);
        }
        return Result.success(values);
    },

    combine<T extends Record<string, Result<any, any>>>(
        results: T,
    ): Result<
        { [K in keyof T]: T[K] extends Result<infer U, any> ? U : never },
        Error
    > {
        const entries = Object.entries(results);
        const values: Record<string, any> = {};

        for (const [key, result] of entries) {
            if (!Result.isSuccess(result)) {
                return result;
            }
            values[key] = result.value;
        }

        return Result.success(values as any);
    },
};

// Type guards
export function isResult<T, E>(value: unknown): value is Result<T, E> {
    return (
        typeof value === 'object' &&
        value !== null &&
        'isSuccess' in value &&
        typeof (value as any).isSuccess === 'boolean'
    );
}
