export interface Manga {
    id: string;
    source: string;
    title: string;
    description?: string;
    cover_image?: string;
    status?: string;
    year?: number;
    authors?: string[];
    artists?: string[];
    genres?: string[];
    publication_demographic?: string;
    content_rating?: string;
    score?: number;
    popularity_score?: number;
    alt_titles?: string[];
    created_at?: string;
    updated_at?: string;
    original_language?: string;
    library_status?: string;
    reading_progress?: ReadingProgress;
  }
  
  export interface Chapter {
    id: string;
    manga_id: string;
    manga_title: string;
    volume?: string;
    chapter?: string;
    title?: string;
    language: string;
    pages: number;
    published_at?: string;
    created_at?: string;
    updated_at?: string;
    source: string;
    cover_image?: string;
  }
  
  export interface ReadingProgress {
    chapter_id: string;
    chapter_number?: string;
    chapter_title?: string;
    last_page: number;
    total_pages: number;
    read_at: string;
  }
  
  export interface ChapterImage {
    index: number;
    url: string;
  }
  
  export interface GenreList {
    [key: string]: string;
  }
  
  export interface StatusList {
    [key: string]: string;
  }
  
  export interface SortOptions {
    [key: string]: string;
  }
  
  export interface MangaFilters {
    search?: string;
    genre?: string;
    status?: string;
    sort?: string;
  }