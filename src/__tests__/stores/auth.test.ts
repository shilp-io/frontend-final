import { act } from '@testing-library/react'
import { useStore } from '@/lib/store'
import { User, LoginCredentials, SignUpCredentials } from '@/types'

describe('Auth Store', () => {
  // Clear the store before each test
  beforeEach(() => {
    act(() => {
      useStore.setState({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      })
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useStore.getState()
      expect(state.user).toBeNull()
      expect(state.isLoading).toBeFalsy()
      expect(state.error).toBeNull()
      expect(state.isAuthenticated).toBeFalsy()
    })
  })

  describe('Authentication Actions', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      firebase_uid: 'firebase123',
      display_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      job_title: 'Developer',
      department: 'Engineering',
      theme: 'light',
      notification_preferences: 'all',
      email_notifications: true,
      timezone: 'UTC',
      bio: 'Test bio',
      tags: ['test'],
      metadata: {},
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    it('should handle login success', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      // Mock the login function
      const mockLogin = jest.fn().mockResolvedValue({
        user: mockUser,
        error: null,
        session: { token: 'test-token' }
      })

      act(() => {
        useStore.setState({
          login: mockLogin
        })
      })

      // Attempt login
      const state = useStore.getState()
      const result = await state.login(credentials)

      expect(mockLogin).toHaveBeenCalledWith(credentials)
      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('should handle login failure', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrong-password'
      }

      // Mock the login function with error
      const mockLogin = jest.fn().mockResolvedValue({
        user: null,
        error: 'Invalid credentials',
        session: null
      })

      act(() => {
        useStore.setState({
          login: mockLogin
        })
      })

      // Attempt login
      const state = useStore.getState()
      const result = await state.login(credentials)

      expect(mockLogin).toHaveBeenCalledWith(credentials)
      expect(result.user).toBeNull()
      expect(result.error).toBe('Invalid credentials')
    })

    it('should handle user state updates', () => {
      act(() => {
        useStore.getState().setUser(mockUser)
      })

      const state = useStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBeTruthy()
    })

    it('should handle logout', async () => {
      // Set initial authenticated state
      act(() => {
        useStore.setState({
          user: mockUser,
          isAuthenticated: true
        })
      })

      const mockLogout = jest.fn().mockResolvedValue(undefined)
      act(() => {
        useStore.setState({
          logout: mockLogout
        })
      })

      // Perform logout
      const state = useStore.getState()
      await state.logout()

      expect(mockLogout).toHaveBeenCalled()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBeFalsy()
    })
  })

  describe('Loading and Error States', () => {
    it('should handle loading state', () => {
      act(() => {
        useStore.getState().setLoading(true)
      })

      const state = useStore.getState()
      expect(state.isLoading).toBeTruthy()
    })

    it('should handle error state', () => {
      const errorMessage = 'Test error'
      act(() => {
        useStore.getState().setError(errorMessage)
      })

      const state = useStore.getState()
      expect(state.error).toBe(errorMessage)
    })

    it('should clear error state', () => {
      // Set initial error state
      act(() => {
        useStore.getState().setError('Test error')
      })

      // Clear error
      act(() => {
        useStore.getState().clearError()
      })

      const state = useStore.getState()
      expect(state.error).toBeNull()
    })
  })
}) 