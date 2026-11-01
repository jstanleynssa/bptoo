export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tags']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['tags']['Insert']>
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          cover_image_url: string | null
          category_id: string | null
          status: 'draft' | 'published'
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      post_tags: {
        Row: { post_id: string; tag_id: string }
        Insert: Database['public']['Tables']['post_tags']['Row']
        Update: Partial<Database['public']['Tables']['post_tags']['Row']>
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          content: string | null
          cover_image_url: string | null
          images: string[]
          url: string | null
          github_url: string | null
          status: 'draft' | 'published'
          featured: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      project_tags: {
        Row: { project_id: string; tag_id: string }
        Insert: Database['public']['Tables']['project_tags']['Row']
        Update: Partial<Database['public']['Tables']['project_tags']['Row']>
      }
      artwork: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          image_url: string
          medium: string | null
          year: number | null
          status: 'draft' | 'published'
          featured: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['artwork']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['artwork']['Insert']>
      }
      artwork_tags: {
        Row: { artwork_id: string; tag_id: string }
        Insert: Database['public']['Tables']['artwork_tags']['Row']
        Update: Partial<Database['public']['Tables']['artwork_tags']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience types
export type Category = Database['public']['Tables']['categories']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Artwork = Database['public']['Tables']['artwork']['Row']

export type PostWithRelations = Post & {
  categories: Category | null
  post_tags: { tags: Tag }[]
}

export type ProjectWithTags = Project & {
  project_tags: { tags: Tag }[]
}

export type ArtworkWithTags = Artwork & {
  artwork_tags: { tags: Tag }[]
}
