import { useCallback, useEffect, useState } from 'react';
import type { UserRegistrationData } from '@/lib/services/auth';
import { authService } from '@/lib/services/auth';
import { useAppStore } from '@/lib/store/appStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/lib/store/userStore';
import type { ServiceContextUser } from '@/types/auth';

interface OAuthProfileData {
    firebase_uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
}

// Query keys
const USER_QUERY_KEY = ['currentUser'] as const;
const USER_PROFILE_QUERY_KEY = ['userProfile'] as const;

export function useAuth() {
    const { user, setUser } = useUserStore();
    const setLoading = useAppStore(state => state.setLoading);
    const setError = useAppStore(state => state.setError);
    const loading = useAppStore(state => state.isLoading);
    const error = useAppStore(state => state.error);
    const queryClient = useQueryClient();

    // Add initialization state
    const [isInitialized, setIsInitialized] = useState(false);

    // User profile query
    const { data: userProfile } = useQuery({
        queryKey: USER_PROFILE_QUERY_KEY,
        queryFn: () => user ? fetchUserProfile(user.firebase_user.uid) : null,
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Profile mutation
    const profileMutation = useMutation({
        mutationFn: async ({ userId, data }: { userId: string, data: Partial<UserRegistrationData> }) => {
            const response = await fetch(`/api/db/user-profiles/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    display_name: data.displayName,
                    avatar_url: data.photoURL,
                    job_title: data.jobTitle,
                    department: data.department,
                    updated_at: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user profile in database');
            }

            return response.json();
        },
        onSuccess: (data) => {
            queryClient.setQueryData(USER_PROFILE_QUERY_KEY, data);
        },
        onError: (error) => {
            setError(error instanceof Error ? error.message : 'Profile update failed');
        }
    });

    // Sign in mutation
    const signInMutation = useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            const { success, error: authError, user } = await authService.signIn(email, password);
            
            if (!success || authError) {
                throw new Error(authError || 'Sign in failed');
            }

            return { user };
        },
        onError: (error) => {
            setError(error instanceof Error ? error.message : 'Sign in failed');
        }
    });

    // Registration mutation
    const registerMutation = useMutation({
        mutationFn: async (userData: UserRegistrationData) => {
            const { success, error: authError, user } = await authService.registerUser(userData);
            
            if (!success || authError) {
                throw new Error(authError || 'Registration failed');
            }

            if (user) {
                // Create user profile in database
                const profile = await createUserProfile({
                    ...userData,
                    firebase_uid: user.uid,
                });
                queryClient.setQueryData(USER_PROFILE_QUERY_KEY, profile);
            }

            return { user };
        },
        onError: (error) => {
            setError(error instanceof Error ? error.message : 'Registration failed');
        }
    });

    // OAuth sign in mutation
    const oAuthSignInMutation = useMutation({
        mutationFn: async (provider: 'google' | 'github') => {
            const authMethod = provider === 'google' ? authService.signInWithGoogle : authService.signInWithGithub;
            const { success, error: authError, user } = await authMethod.call(authService);
            
            if (!success || authError) {
                throw new Error(authError || `${provider} sign in failed`);
            }

            if (user) {
                try {
                    // Try to fetch existing profile
                    const profile = await fetchUserProfile(user.uid);
                    queryClient.setQueryData(USER_PROFILE_QUERY_KEY, profile);
                } catch (err) {
                    // If profile doesn't exist, create one
                    const newProfile = await createUserProfile({
                        firebase_uid: user.uid,
                        email: user.email || '',
                        displayName: user.displayName || user.email?.split('@')[0] || '',
                        photoURL: user.photoURL || undefined
                    });
                    queryClient.setQueryData(USER_PROFILE_QUERY_KEY, newProfile);
                }
                queryClient.setQueryData(USER_QUERY_KEY, user);
            }
            return { user };
        },
        onError: (error) => {
            setError(error instanceof Error ? error.message : 'OAuth sign in failed');
        }
    });

    // Password reset mutation
    const resetPasswordMutation = useMutation({
        mutationFn: async (email: string) => {
            const { success, error: authError } = await authService.resetPassword(email);
            
            if (!success || authError) {
                throw new Error(authError || 'Password reset failed');
            }
            return { success: true };
        },
        onError: (error) => {
            setError(error instanceof Error ? error.message : 'Password reset failed');
        }
    });

    // Sign out mutation
    const signOutMutation = useMutation({
        mutationFn: async () => {
            const { success, error: authError } = await authService.signOut();
            
            if (!success || authError) {
                throw new Error(authError || 'Sign out failed');
            }
            return { success: true };
        },
        onSuccess: () => {
            // Clear all auth-related queries
            queryClient.setQueryData(USER_QUERY_KEY, null);
            queryClient.setQueryData(USER_PROFILE_QUERY_KEY, null);
        },
        onError: (error) => {
            setError(error instanceof Error ? error.message : 'Sign out failed');
        }
    });

    // Initialize auth state
    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                // Create a ServiceContextUser object
                const serviceUser: ServiceContextUser = {
                    id: '', // This will be set after fetching the profile
                    firebase_user: firebaseUser,
                    firebase_uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    display_name: firebaseUser.displayName,
                    avatar_url: firebaseUser.photoURL,
                    job_title: null,
                    department: null,
                    theme: 'light',
                    notification_preferences: 'all',
                    email_notifications: true,
                    timezone: null,
                    bio: null,
                    tags: null,
                    metadata: null,
                    last_active_at: null,
                    created_at: null,
                    updated_at: null
                };
                setUser(serviceUser);
                queryClient.setQueryData(USER_QUERY_KEY, serviceUser);
                // Trigger a refetch of the user profile
                queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
            } else {
                setUser(null);
                queryClient.setQueryData(USER_QUERY_KEY, null);
                queryClient.setQueryData(USER_PROFILE_QUERY_KEY, null);
            }
            setIsInitialized(true);
        });

        return () => unsubscribe();
    }, [queryClient, setUser]);

    const fetchUserProfile = useCallback(async (firebaseUid: string) => {
        try {
            const response = await fetch(`/api/db/user-profiles?firebaseUid=${firebaseUid}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }
            const profile = await response.json();
            
            // Update the user's id with the Supabase profile id
            if (profile && user) {
                const updatedUser: ServiceContextUser = {
                    ...user,
                    id: profile.id, // Set the Supabase user profile ID
                    display_name: profile.display_name,
                    avatar_url: profile.avatar_url,
                    job_title: profile.job_title,
                    department: profile.department,
                    theme: profile.theme,
                    notification_preferences: profile.notification_preferences,
                    email_notifications: profile.email_notifications,
                    timezone: profile.timezone,
                    bio: profile.bio,
                    tags: profile.tags,
                    last_active_at: profile.last_active_at
                };
                setUser(updatedUser);
                queryClient.setQueryData(USER_QUERY_KEY, updatedUser);
            }
            
            return profile;
        } catch (err) {
            console.error('Error fetching user profile:', err);
            throw err;
        }
    }, [user, setUser, queryClient]);

    const createUserProfile = useCallback(async (userData: OAuthProfileData | (UserRegistrationData & { firebase_uid: string })) => {
        try {
            const response = await fetch('/api/db/user-profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firebase_uid: userData.firebase_uid,
                    display_name: userData.displayName || userData.email.split('@')[0],
                    email: userData.email,
                    avatar_url: 'photoURL' in userData ? userData.photoURL : null,
                    email_notifications: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create user profile');
            }

            const profile = await response.json();
            return profile;
        } catch (err) {
            console.error('Error creating user profile:', err);
            throw err;
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            return await signInMutation.mutateAsync({ email, password });
        } finally {
            setLoading(false);
        }
    }, [signInMutation, setLoading, setError]);

    const signOut = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            return await signOutMutation.mutateAsync();
        } finally {
            setLoading(false);
        }
    }, [signOutMutation, setLoading, setError]);

    const registerUser = useCallback(async (userData: UserRegistrationData) => {
        try {
            setLoading(true);
            setError(null);
            return await registerMutation.mutateAsync(userData);
        } finally {
            setLoading(false);
        }
    }, [registerMutation, setLoading, setError]);

    const updateProfile = useCallback(async (userId: string, profileData: Partial<UserRegistrationData>) => {
        try {
            setLoading(true);
            setError(null);
            
            // Update Firebase profile
            const { success, error: authError } = await authService.updateProfile(userId, profileData);
            
            if (!success || authError) {
                throw new Error(authError || 'Profile update failed');
            }

            // Update user profile using the mutation
            await profileMutation.mutateAsync({ userId, data: profileData });

            return { success: true, profile: queryClient.getQueryData(USER_PROFILE_QUERY_KEY) };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Profile update failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [profileMutation, queryClient, setError, setLoading]);

    const signInWithProvider = useCallback(async (provider: 'google' | 'github') => {
        try {
            setLoading(true);
            setError(null);
            return await oAuthSignInMutation.mutateAsync(provider);
        } finally {
            setLoading(false);
        }
    }, [oAuthSignInMutation, setLoading, setError]);

    const resetPassword = useCallback(async (email: string) => {
        try {
            setLoading(true);
            setError(null);
            return await resetPasswordMutation.mutateAsync(email);
        } finally {
            setLoading(false);
        }
    }, [resetPasswordMutation, setLoading, setError]);

    return {
        user,
        userProfile,
        loading: loading || 
                signInMutation.isPending || 
                registerMutation.isPending || 
                oAuthSignInMutation.isPending || 
                resetPasswordMutation.isPending || 
                signOutMutation.isPending || 
                profileMutation.isPending,
        error,
        signIn,
        signOut,
        registerUser,
        updateProfile,
        signInWithGoogle: () => signInWithProvider('google'),
        signInWithGithub: () => signInWithProvider('github'),
        resetPassword,
        isInitialized
    };
}
