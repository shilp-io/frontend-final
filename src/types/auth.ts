import type { UUID, ISODateTime, BaseEntity } from './common'
import type { Json } from './supabase'
import type { UserTheme, NotificationPreference } from './enums'
import type { User as FirebaseUser } from 'firebase/auth'

export interface UserProfile extends BaseEntity {
  firebase_uid: string | null
  supabase_uid: UUID | null
  display_name: string | null
  avatar_url: string | null
  job_title: string | null
  department: string | null
  theme: UserTheme
  notification_preferences: NotificationPreference
  email_notifications: boolean
  timezone: string | null
  bio: string | null
  tags: string[] | null
  last_active_at: ISODateTime | null
}

export interface User {
  id: UUID
  email: string | null
  firebase_uid: string | null
  display_name: string | null
  avatar_url: string | null
  job_title: string | null
  department: string | null
  theme: UserTheme
  notification_preferences: NotificationPreference
  email_notifications: boolean
  timezone: string | null
  bio: string | null
  tags: string[] | null
  metadata: Json | null
  last_active_at: ISODateTime | null
  created_at: ISODateTime | null
  updated_at: ISODateTime | null
}

export interface AuthResponse {
  user: User | null
  session: any // Replace with specific session type if available
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends LoginCredentials {
  display_name?: string
}

export interface UpdateProfileData extends Partial<Omit<UserProfile, keyof BaseEntity | 'firebase_uid' | 'supabase_uid'>> {
  id: UUID
}

export interface AuthContextState {
  user: User | null
  isLoading: boolean
  error: string | null
}

export interface AuthContextValue extends AuthContextState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  logout: () => Promise<void>
  signup: (credentials: SignUpCredentials) => Promise<AuthResponse>
  updateProfile: (data: UpdateProfileData) => Promise<User>
}

export interface GetUsersParams {
  page?: number
  per_page?: number
  search?: string
  department?: string
  role?: string
}

export interface UpdateUserParams {
  user_id: UUID
  data: Partial<UserProfile>
}

export interface UserNotification extends BaseEntity {
  user_id: UUID
  title: string
  message: string
  type: string
  read: boolean
  read_at: ISODateTime | null
  action_url: string | null
  expires_at: ISODateTime | null
}

export interface UserPreferences {
  theme: UserTheme
  notification_preferences: NotificationPreference
  email_notifications: boolean
  timezone: string | null
  language: string
  accessibility_settings: {
    high_contrast: boolean
    font_size: 'small' | 'medium' | 'large'
    reduce_animations: boolean
  }
}

export interface ServiceContextUser {
  id: UUID // This will be the Supabase user profile ID
  firebase_user: FirebaseUser
  firebase_uid: string | null
  email: string | null
  display_name: string | null
  avatar_url: string | null
  job_title: string | null
  department: string | null
  theme: UserTheme
  notification_preferences: NotificationPreference
  email_notifications: boolean
  timezone: string | null
  bio: string | null
  tags: string[] | null
  metadata: Json | null
  last_active_at: ISODateTime | null
  created_at: ISODateTime | null
  updated_at: ISODateTime | null
} 