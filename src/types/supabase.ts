export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      collection_owners: {
        Row: {
          collection_id: string;
          user_id: string;
        };
        Insert: {
          collection_id: string;
          user_id: string;
        };
        Update: {
          collection_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collection_owners_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_owners_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      collections: {
        Row: {
          access_level: Database["public"]["Enums"]["collection_access_level"];
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          metadata: Json | null;
          name: string;
          parent_id: string | null;
          tags: string[] | null;
          updated_at: string | null;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          access_level?: Database["public"]["Enums"]["collection_access_level"];
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          name: string;
          parent_id?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          access_level?: Database["public"]["Enums"]["collection_access_level"];
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          name?: string;
          parent_id?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "collections_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collections_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collections_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      external_docs: {
        Row: {
          author: string | null;
          collection_id: string | null;
          created_at: string | null;
          created_by: string | null;
          id: string;
          last_verified_date: string | null;
          metadata: Json | null;
          publication_date: string | null;
          status: string;
          tags: string[] | null;
          title: string;
          type: Database["public"]["Enums"]["document_type"];
          updated_at: string | null;
          updated_by: string | null;
          url: string;
          version: number;
          version_info: string | null;
        };
        Insert: {
          author?: string | null;
          collection_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          last_verified_date?: string | null;
          metadata?: Json | null;
          publication_date?: string | null;
          status?: string;
          tags?: string[] | null;
          title: string;
          type: Database["public"]["Enums"]["document_type"];
          updated_at?: string | null;
          updated_by?: string | null;
          url: string;
          version?: number;
          version_info?: string | null;
        };
        Update: {
          author?: string | null;
          collection_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          last_verified_date?: string | null;
          metadata?: Json | null;
          publication_date?: string | null;
          status?: string;
          tags?: string[] | null;
          title?: string;
          type?: Database["public"]["Enums"]["document_type"];
          updated_at?: string | null;
          updated_by?: string | null;
          url?: string;
          version?: number;
          version_info?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "external_docs_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "external_docs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "external_docs_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      firebase_users: {
        Row: {
          created_at: string | null;
          email: string | null;
          id: string;
          last_sign_in: string | null;
          provider: string;
          supabase_uid: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          id: string;
          last_sign_in?: string | null;
          provider?: string;
          supabase_uid?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          id?: string;
          last_sign_in?: string | null;
          provider?: string;
          supabase_uid?: string | null;
        };
        Relationships: [];
      };
      project_collections: {
        Row: {
          collection_id: string;
          project_id: string;
        };
        Insert: {
          collection_id: string;
          project_id: string;
        };
        Update: {
          collection_id?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_collections_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_collections_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_documents: {
        Row: {
          document_id: string;
          project_id: string;
        };
        Insert: {
          document_id: string;
          project_id: string;
        };
        Update: {
          document_id?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_documents_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "external_docs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_documents_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_members: {
        Row: {
          joined_at: string | null;
          project_id: string;
          role: Database["public"]["Enums"]["member_role"];
          user_id: string;
        };
        Insert: {
          joined_at?: string | null;
          project_id: string;
          role?: Database["public"]["Enums"]["member_role"];
          user_id: string;
        };
        Update: {
          joined_at?: string | null;
          project_id?: string;
          role?: Database["public"]["Enums"]["member_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          actual_end_date: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          metadata: Json | null;
          name: string;
          start_date: string | null;
          status: Database["public"]["Enums"]["project_status"];
          tags: string[] | null;
          target_end_date: string | null;
          updated_at: string | null;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          actual_end_date?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          name: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          tags?: string[] | null;
          target_end_date?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          actual_end_date?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          name?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          tags?: string[] | null;
          target_end_date?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      requirement_collections: {
        Row: {
          collection_id: string;
          requirement_id: string;
        };
        Insert: {
          collection_id: string;
          requirement_id: string;
        };
        Update: {
          collection_id?: string;
          requirement_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "requirement_collections_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requirement_collections_requirement_id_fkey";
            columns: ["requirement_id"];
            isOneToOne: false;
            referencedRelation: "requirements";
            referencedColumns: ["id"];
          },
        ];
      };
      requirement_dependencies: {
        Row: {
          depends_on_id: string;
          requirement_id: string;
        };
        Insert: {
          depends_on_id: string;
          requirement_id: string;
        };
        Update: {
          depends_on_id?: string;
          requirement_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "requirement_dependencies_depends_on_id_fkey";
            columns: ["depends_on_id"];
            isOneToOne: false;
            referencedRelation: "requirements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requirement_dependencies_requirement_id_fkey";
            columns: ["requirement_id"];
            isOneToOne: false;
            referencedRelation: "requirements";
            referencedColumns: ["id"];
          },
        ];
      };
      requirement_documents: {
        Row: {
          document_id: string;
          requirement_id: string;
        };
        Insert: {
          document_id: string;
          requirement_id: string;
        };
        Update: {
          document_id?: string;
          requirement_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "requirement_documents_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "external_docs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requirement_documents_requirement_id_fkey";
            columns: ["requirement_id"];
            isOneToOne: false;
            referencedRelation: "requirements";
            referencedColumns: ["id"];
          },
        ];
      };
      requirement_trace_links: {
        Row: {
          from_requirement_id: string;
          link_type: Database["public"]["Enums"]["trace_link_type"];
          to_requirement_id: string;
        };
        Insert: {
          from_requirement_id: string;
          link_type: Database["public"]["Enums"]["trace_link_type"];
          to_requirement_id: string;
        };
        Update: {
          from_requirement_id?: string;
          link_type?: Database["public"]["Enums"]["trace_link_type"];
          to_requirement_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "requirement_trace_links_from_requirement_id_fkey";
            columns: ["from_requirement_id"];
            isOneToOne: false;
            referencedRelation: "requirements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requirement_trace_links_to_requirement_id_fkey";
            columns: ["to_requirement_id"];
            isOneToOne: false;
            referencedRelation: "requirements";
            referencedColumns: ["id"];
          },
        ];
      };
      requirements: {
        Row: {
          acceptance_criteria: string[] | null;
          assigned_to: string | null;
          created_at: string | null;
          created_by: string | null;
          current_req: Json | null;
          description: string | null;
          history_req: Json[] | null;
          id: string;
          metadata: Json | null;
          original_req: string | null;
          parent_id: string | null;
          priority: Database["public"]["Enums"]["requirement_priority"];
          project_id: string | null;
          reviewer: string | null;
          rewritten_ears: string | null;
          rewritten_incose: string | null;
          selected_format: string | null;
          status: Database["public"]["Enums"]["requirement_status"];
          tags: string[] | null;
          title: string;
          updated_at: string | null;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          acceptance_criteria?: string[] | null;
          assigned_to?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          current_req?: Json | null;
          description?: string | null;
          history_req?: Json[] | null;
          id?: string;
          metadata?: Json | null;
          original_req?: string | null;
          parent_id?: string | null;
          priority?: Database["public"]["Enums"]["requirement_priority"];
          project_id?: string | null;
          reviewer?: string | null;
          rewritten_ears?: string | null;
          rewritten_incose?: string | null;
          selected_format?: string | null;
          status?: Database["public"]["Enums"]["requirement_status"];
          tags?: string[] | null;
          title: string;
          updated_at?: string | null;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          acceptance_criteria?: string[] | null;
          assigned_to?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          current_req?: Json | null;
          description?: string | null;
          history_req?: Json[] | null;
          id?: string;
          metadata?: Json | null;
          original_req?: string | null;
          parent_id?: string | null;
          priority?: Database["public"]["Enums"]["requirement_priority"];
          project_id?: string | null;
          reviewer?: string | null;
          rewritten_ears?: string | null;
          rewritten_incose?: string | null;
          selected_format?: string | null;
          status?: Database["public"]["Enums"]["requirement_status"];
          tags?: string[] | null;
          title?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "requirements_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requirements_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requirements_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "requirements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requirements_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requirements_reviewer_fkey";
            columns: ["reviewer"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requirements_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          department: string | null;
          display_name: string | null;
          email: string | null;
          email_notifications: boolean;
          firebase_uid: string | null;
          id: string;
          job_title: string | null;
          last_active_at: string | null;
          metadata: Json | null;
          notification_preferences: Database["public"]["Enums"]["notification_preference"];
          supabase_uid: string | null;
          tags: string[] | null;
          theme: Database["public"]["Enums"]["user_theme"];
          timezone: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          department?: string | null;
          display_name?: string | null;
          email?: string | null;
          email_notifications?: boolean;
          firebase_uid?: string | null;
          id: string;
          job_title?: string | null;
          last_active_at?: string | null;
          metadata?: Json | null;
          notification_preferences?: Database["public"]["Enums"]["notification_preference"];
          supabase_uid?: string | null;
          tags?: string[] | null;
          theme?: Database["public"]["Enums"]["user_theme"];
          timezone?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          department?: string | null;
          display_name?: string | null;
          email?: string | null;
          email_notifications?: boolean;
          firebase_uid?: string | null;
          id?: string;
          job_title?: string | null;
          last_active_at?: string | null;
          metadata?: Json | null;
          notification_preferences?: Database["public"]["Enums"]["notification_preference"];
          supabase_uid?: string | null;
          tags?: string[] | null;
          theme?: Database["public"]["Enums"]["user_theme"];
          timezone?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      users_view: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          department: string | null;
          display_name: string | null;
          email: string | null;
          email_notifications: boolean | null;
          firebase_uid: string | null;
          id: string | null;
          job_title: string | null;
          last_active_at: string | null;
          metadata: Json | null;
          notification_preferences:
            | Database["public"]["Enums"]["notification_preference"]
            | null;
          tags: string[] | null;
          theme: Database["public"]["Enums"]["user_theme"] | null;
          timezone: string | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_user_profile_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      collection_access_level:
        | "private"
        | "project"
        | "organization"
        | "public";
      document_type:
        | "specification"
        | "reference"
        | "documentation"
        | "standard"
        | "guideline"
        | "report";
      member_role: "owner" | "manager" | "contributor" | "viewer";
      notification_preference: "all" | "important" | "none";
      project_status: "draft" | "active" | "on_hold" | "completed" | "archived";
      requirement_priority: "critical" | "high" | "medium" | "low";
      requirement_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "in_progress"
        | "testing"
        | "completed"
        | "rejected";
      trace_link_type:
        | "derives_from"
        | "implements"
        | "relates_to"
        | "conflicts_with";
      user_theme: "light" | "dark" | "system";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
