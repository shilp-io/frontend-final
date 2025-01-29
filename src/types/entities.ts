import type {
  UUID,
  ISODateTime,
  BaseEntity,
  ProjectStatus,
  RequirementStatus,
  RequirementPriority,
  AccessLevel,
  TraceLinkType,
  MemberRole,
  DocumentType,
} from "./index";
import type { Json } from "./supabase";

export interface Project extends BaseEntity {
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: ISODateTime | null;
  target_end_date: ISODateTime | null;
  actual_end_date: ISODateTime | null;
  tags: string[] | null;
  metadata: Json | null;
}

export interface ProjectMember {
  project_id: UUID;
  user_id: UUID;
  role: MemberRole;
  joined_at: ISODateTime | null;
}

export interface Requirement extends BaseEntity {
  project_id: UUID | null;
  parent_id: UUID | null;
  title: string;
  description: string | null;
  acceptance_criteria: string[] | null;
  priority: RequirementPriority;
  status: RequirementStatus;
  assigned_to: UUID | null;
  reviewer: UUID | null;
  tags: string[] | null;
  original_req: string | null;
  current_req: JSON | null;
  history_req: JSON[] | null;
  rewritten_ears: string | null;
  rewritten_incose: string | null;
  selected_format: string | null;
  metadata: Json | null;
}

export interface RequirementTraceLink {
  from_requirement_id: UUID;
  to_requirement_id: UUID;
  link_type: TraceLinkType;
}

export interface Collection extends BaseEntity {
  name: string;
  description: string | null;
  parent_id: UUID | null;
  access_level: AccessLevel;
  tags: string[] | null;
}

export interface ExternalDoc extends BaseEntity {
  collection_id: UUID | null;
  title: string;
  url: string;
  type: DocumentType;
  version_info: string | null;
  author: string | null;
  publication_date: ISODateTime | null;
  last_verified_date: ISODateTime | null;
  status: string;
  tags: string[] | null;
}
