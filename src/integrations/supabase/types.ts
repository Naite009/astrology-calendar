export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      astrology_documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_type: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cosmic_weather_cache: {
        Row: {
          chart_id: string
          content: string
          created_at: string
          date_key: string
          device_id: string
          expires_at: string
          id: string
          updated_at: string
          user_id: string | null
          voice_style: string
        }
        Insert: {
          chart_id?: string
          content: string
          created_at?: string
          date_key: string
          device_id?: string
          expires_at: string
          id?: string
          updated_at?: string
          user_id?: string | null
          voice_style?: string
        }
        Update: {
          chart_id?: string
          content?: string
          created_at?: string
          date_key?: string
          device_id?: string
          expires_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          voice_style?: string
        }
        Relationships: []
      }
      device_charts: {
        Row: {
          chart_data: Json
          chart_id: string
          chart_name: string
          created_at: string | null
          device_id: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chart_data: Json
          chart_id: string
          chart_name: string
          created_at?: string | null
          device_id: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chart_data?: Json
          chart_id?: string
          chart_name?: string
          created_at?: string | null
          device_id?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      life_events: {
        Row: {
          chart_id: string
          created_at: string
          device_id: string
          event_date: string
          event_label: string | null
          event_type: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          chart_id: string
          created_at?: string
          device_id: string
          event_date: string
          event_label?: string | null
          event_type: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          chart_id?: string
          created_at?: string
          device_id?: string
          event_date?: string
          event_label?: string | null
          event_type?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lunar_cycle_journals: {
        Row: {
          ai_suggested_intentions: string | null
          balsamic_date: string | null
          balsamic_different: string | null
          balsamic_evolved: string | null
          balsamic_reflections: string | null
          chart_id: string
          created_at: string
          cycle_degree: number | null
          cycle_next_stirrings: string | null
          cycle_sign: string
          cycle_start_date: string
          cycle_wisdom: string | null
          device_id: string
          first_quarter_adjustments: string | null
          first_quarter_date: string | null
          first_quarter_obstacles: string | null
          first_quarter_showing_up: string | null
          full_moon_date: string | null
          full_moon_gratitude: string | null
          full_moon_releasing: string | null
          full_moon_showing_up: string | null
          id: string
          last_quarter_date: string | null
          last_quarter_letting_go: string | null
          last_quarter_patterns: string | null
          last_quarter_showing_up: string | null
          new_moon_body_sensations: string | null
          new_moon_date: string | null
          new_moon_feelings: string | null
          new_moon_house_themes: string | null
          new_moon_intentions: string | null
          new_moon_showing_up: string | null
          oracle_ai_interpretation: string | null
          oracle_card_name: string | null
          oracle_card_notes: string | null
          oracle_deck_name: string | null
          tarot_ai_interpretation: string | null
          tarot_card_name: string | null
          tarot_card_notes: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_suggested_intentions?: string | null
          balsamic_date?: string | null
          balsamic_different?: string | null
          balsamic_evolved?: string | null
          balsamic_reflections?: string | null
          chart_id: string
          created_at?: string
          cycle_degree?: number | null
          cycle_next_stirrings?: string | null
          cycle_sign: string
          cycle_start_date: string
          cycle_wisdom?: string | null
          device_id: string
          first_quarter_adjustments?: string | null
          first_quarter_date?: string | null
          first_quarter_obstacles?: string | null
          first_quarter_showing_up?: string | null
          full_moon_date?: string | null
          full_moon_gratitude?: string | null
          full_moon_releasing?: string | null
          full_moon_showing_up?: string | null
          id?: string
          last_quarter_date?: string | null
          last_quarter_letting_go?: string | null
          last_quarter_patterns?: string | null
          last_quarter_showing_up?: string | null
          new_moon_body_sensations?: string | null
          new_moon_date?: string | null
          new_moon_feelings?: string | null
          new_moon_house_themes?: string | null
          new_moon_intentions?: string | null
          new_moon_showing_up?: string | null
          oracle_ai_interpretation?: string | null
          oracle_card_name?: string | null
          oracle_card_notes?: string | null
          oracle_deck_name?: string | null
          tarot_ai_interpretation?: string | null
          tarot_card_name?: string | null
          tarot_card_notes?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_suggested_intentions?: string | null
          balsamic_date?: string | null
          balsamic_different?: string | null
          balsamic_evolved?: string | null
          balsamic_reflections?: string | null
          chart_id?: string
          created_at?: string
          cycle_degree?: number | null
          cycle_next_stirrings?: string | null
          cycle_sign?: string
          cycle_start_date?: string
          cycle_wisdom?: string | null
          device_id?: string
          first_quarter_adjustments?: string | null
          first_quarter_date?: string | null
          first_quarter_obstacles?: string | null
          first_quarter_showing_up?: string | null
          full_moon_date?: string | null
          full_moon_gratitude?: string | null
          full_moon_releasing?: string | null
          full_moon_showing_up?: string | null
          id?: string
          last_quarter_date?: string | null
          last_quarter_letting_go?: string | null
          last_quarter_patterns?: string | null
          last_quarter_showing_up?: string | null
          new_moon_body_sensations?: string | null
          new_moon_date?: string | null
          new_moon_feelings?: string | null
          new_moon_house_themes?: string | null
          new_moon_intentions?: string | null
          new_moon_showing_up?: string | null
          oracle_ai_interpretation?: string | null
          oracle_card_name?: string | null
          oracle_card_notes?: string | null
          oracle_deck_name?: string | null
          tarot_ai_interpretation?: string | null
          tarot_card_name?: string | null
          tarot_card_notes?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
