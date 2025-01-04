export const ProjectStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
} as const
export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus]

export const RequirementStatus = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  TESTING: 'testing',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
} as const
export type RequirementStatus = typeof RequirementStatus[keyof typeof RequirementStatus]

export const RequirementPriority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const
export type RequirementPriority = typeof RequirementPriority[keyof typeof RequirementPriority]

export const AccessLevel = {
  PRIVATE: 'private',
  PROJECT: 'project',
  ORGANIZATION: 'organization',
  PUBLIC: 'public'
} as const
export type AccessLevel = typeof AccessLevel[keyof typeof AccessLevel]

export const TraceLinkType = {
  DERIVES_FROM: 'derives_from',
  IMPLEMENTS: 'implements',
  RELATES_TO: 'relates_to',
  CONFLICTS_WITH: 'conflicts_with'
} as const
export type TraceLinkType = typeof TraceLinkType[keyof typeof TraceLinkType]

export const MemberRole = {
  OWNER: 'owner',
  MANAGER: 'manager',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer'
} as const
export type MemberRole = typeof MemberRole[keyof typeof MemberRole]

export const DocumentType = {
  SPECIFICATION: 'specification',
  REFERENCE: 'reference',
  DOCUMENTATION: 'documentation',
  STANDARD: 'standard',
  GUIDELINE: 'guideline',
  REPORT: 'report'
} as const
export type DocumentType = typeof DocumentType[keyof typeof DocumentType]

export const UserTheme = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const
export type UserTheme = typeof UserTheme[keyof typeof UserTheme]

export const NotificationPreference = {
  ALL: 'all',
  IMPORTANT: 'important',
  NONE: 'none'
} as const
export type NotificationPreference = typeof NotificationPreference[keyof typeof NotificationPreference]

export const ServiceStatus = {
  UNINITIALIZED: 'uninitialized',
  INITIALIZING: 'initializing',
  READY: 'ready',
  ERROR: 'error'
} as const
export type ServiceStatus = typeof ServiceStatus[keyof typeof ServiceStatus] 