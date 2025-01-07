// src/lib/services/auth.ts

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    UserCredential,
    sendEmailVerification,
    type User,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateEmail,
    updatePassword,
    updateProfile as firebaseUpdateProfile,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    type Unsubscribe
} from 'firebase/auth';
import { BaseService, type ServiceConfig } from './base';
import Cookies from 'js-cookie';

export interface UserRegistrationData {
    email: string;
    password: string;
    displayName?: string;
    jobTitle?: string;
    department?: string;
    photoURL?: string;
}

interface AuthResponse {
    success: boolean;
    error?: string;
    user?: User;
}

export class AuthService extends BaseService {
    protected serviceName = 'AuthService';
    private static instance: AuthService | null = null;

    protected constructor(config?: ServiceConfig) {
        super({
            logLevel: 'info',
            retryAttempts: 1, // Auth operations shouldn't retry automatically
            ...config
        });
    }

    public static getInstance(config?: ServiceConfig): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService(config);
        }
        return AuthService.instance;
    }

    async registerUser(userData: UserRegistrationData): Promise<AuthResponse> {
        return this.withErrorHandling(async () => {
            // Create Firebase user
            let firebaseAuth: UserCredential;
            try {
                firebaseAuth = await createUserWithEmailAndPassword(
                    this.firebaseAuth,
                    userData.email,
                    userData.password
                );
            } catch (error) {
                throw new Error(`Firebase registration failed: ${error instanceof Error ? error.message : String(error)}`);
            }

            // Send verification email
            try {
                if (firebaseAuth.user) {
                    await sendEmailVerification(firebaseAuth.user);
                }
            } catch (error) {
                this.warn('Email verification failed:', error);
                // Continue with registration even if verification email fails
            }

            // Update user profile in Firebase
            await firebaseUpdateProfile(firebaseAuth.user, {
                displayName: userData.displayName || userData.email.split('@')[0],
                photoURL: userData.photoURL
            });

            // Set custom claims for additional user data
            await this.firebaseAuth.currentUser?.getIdTokenResult(true);

            // Set cookie after successful registration
            this.setCookie();

            return {
                success: true,
                user: firebaseAuth.user
            };
        }, { retry: false }).catch((error) => ({
            success: false,
            error: error.message
        }));
    }

    async signIn(email: string, password: string): Promise<AuthResponse> {
        return this.withErrorHandling(async () => {
            // Sign in with Firebase
            const firebaseAuth = await signInWithEmailAndPassword(
                this.firebaseAuth,
                email,
                password
            );

            // Set cookie after successful sign-in
            this.setCookie();

            return {
                success: true,
                user: firebaseAuth.user
            };
        }, { retry: false }).catch((error) => ({
            success: false,
            error: error.message
        }));
    }

    async signOut(): Promise<AuthResponse> {
        return this.withErrorHandling(async () => {
            // Sign out from Firebase
            await firebaseSignOut(this.firebaseAuth);

            // Clear cookie on sign out
            this.clearCookie();

            return { success: true };
        }, { retry: false }).catch((error) => ({
            success: false,
            error: error.message
        }));
    }

    async updateProfile(userId: string, profileData: Partial<UserRegistrationData>): Promise<AuthResponse> {
        return this.withErrorHandling(async () => {
            const user = this.firebaseAuth.currentUser;
            if (!user) throw new Error('No user logged in');

            await firebaseUpdateProfile(user, {
                displayName: profileData.displayName,
                photoURL: profileData.photoURL
            });

            return { success: true };
        }).catch((error) => ({
            success: false,
            error: error.message
        }));
    }

    async getCurrentUser(): Promise<AuthResponse> {
        const token = Cookies.get('token');

        if (!token) {
            return { success: false, error: 'No token found' };
        }

        return this.withErrorHandling(async () => {
            const user = this.firebaseAuth.currentUser;
            if (!user) {
                this.clearCookie(); // Clear invalid token
                throw new Error('User not authenticated');
            }

            return { success: true, user };
        }, { retry: false }).catch((error) => {
            this.clearCookie(); // Clear token on error
            return {
                success: false,
                error: error.message
            };
        });
    }

    async signInWithGoogle(): Promise<AuthResponse> {
        return this.withErrorHandling(async () => {
            const provider = new GoogleAuthProvider();
            const firebaseAuth = await signInWithPopup(this.firebaseAuth, provider);

            this.setCookie();
            return {
                success: true,
                user: firebaseAuth.user
            };
        }, { retry: false }).catch((error) => ({
            success: false,
            error: error.message
        }));
    }

    async signInWithGithub(): Promise<AuthResponse> {
        return this.withErrorHandling(async () => {
            const provider = new GithubAuthProvider();
            const firebaseAuth = await signInWithPopup(this.firebaseAuth, provider);

            this.setCookie();
            return {
                success: true,
                user: firebaseAuth.user
            };
        }, { retry: false }).catch((error) => ({
            success: false,
            error: error.message
        }));
    }

    async resetPassword(email: string): Promise<AuthResponse> {
        return this.withErrorHandling(async () => {
            await sendPasswordResetEmail(this.firebaseAuth, email);
            return { success: true };
        }, { retry: false }).catch((error) => ({
            success: false,
            error: error.message
        }));
    }

    async updateUserEmail(newEmail: string): Promise<AuthResponse> {
        return this.withErrorHandling(async () => {
            const user = this.firebaseAuth.currentUser;
            if (!user) throw new Error('No user logged in');

            await updateEmail(user, newEmail);
            return { success: true };
        }).catch((error) => ({
            success: false,
            error: error.message
        }));
    }

    async updateUserPassword(newPassword: string): Promise<AuthResponse> {
        return this.withErrorHandling(async () => {
            const user = this.firebaseAuth.currentUser;
            if (!user) throw new Error('No user logged in');

            await updatePassword(user, newPassword);
            return { success: true };
        }).catch((error) => ({
            success: false,
            error: error.message
        }));
    }

    async updateUserProfile(data: { displayName?: string; photoURL?: string }): Promise<AuthResponse> {
        return this.withErrorHandling(async () => {
            const user = this.firebaseAuth.currentUser;
            if (!user) throw new Error('No user logged in');

            await firebaseUpdateProfile(user, data);
            return { success: true };
        }).catch((error) => ({
            success: false,
            error: error.message
        }));
    }

    private async setCookie(): Promise<void> {
        const expirationDays = 30;
        
        // Get the actual Firebase ID token
        const user = this.firebaseAuth.currentUser;
        if (!user) return;
        
        const token = await user.getIdToken();
        
        Cookies.set('token', token, {
            expires: expirationDays,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        // Set default role as 'user'
        Cookies.set('user-role', 'user', {
            expires: expirationDays,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
    }

    private clearCookie(): void {
        Cookies.remove('token');
        Cookies.remove('user-role');
    }

    private async syncAuthState(user: User | null): Promise<void> {
        if (user) {
            const token = await user.getIdToken();
            // Set both token and user role cookies
            Cookies.set('token', token, {
                expires: 30,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            Cookies.set('user-role', 'user', {
                expires: 30,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
        } else {
            Cookies.remove('token');
            Cookies.remove('user-role');
        }
    }

    onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
        return firebaseOnAuthStateChanged(this.firebaseAuth, async (user) => {
            // Sync cookies with Firebase auth state
            await this.syncAuthState(user);
            callback(user);
        });
    }
}

// Export a singleton instance
export const authService = AuthService.getInstance();