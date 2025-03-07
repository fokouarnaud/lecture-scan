export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    reading_mode?: 'vertical' | 'horizontal' | 'double-page';
    dark_mode: boolean;
    receive_notifications: boolean;
  }
  
  export interface Auth {
    user: User | null;
  }
  
  export interface UserLibraryItem {
    id: number;
    user_id: number;
    manga_id: string;
    source: string;
    manga_title: string;
    cover_image?: string;
    status: 'reading' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_read';
    created_at: string;
    updated_at: string;
  }
  
  export interface ReadingHistoryItem {
    id: number;
    user_id: number;
    manga_id: string;
    chapter_id: string;
    source: string;
    manga_title: string;
    chapter_number?: string;
    chapter_title?: string;
    last_page: number;
    total_pages: number;
    read_at: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      links: PaginationLink[];
      path: string;
      per_page: number;
      to: number;
      total: number;
    };
  }
  
  export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
  }