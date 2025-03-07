import React from 'react';
import { Head } from '@inertiajs/react';
import MangaCard from '@/components/MangaCard';
import ChapterItem from '@/components/ChapterItem';
import GenreTag from '@/components/GenreTag';
import AppLayout from '@/layouts/AppLayout';
import { Manga, Chapter } from '@/types/manga';

interface HomeProps {
  latestReleases: Chapter[];
  popularManga: Manga[];
  genres: string[];
}

export default function Home({ latestReleases, popularManga, genres }: HomeProps) {
  return (
    <AppLayout>
      <Head title="Home - MangaPulse" />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero section */}
          <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl mb-12 p-6 md:p-10 text-white overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="pattern" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M0 0h100v100H0z" fill="none" />
                    <path d="M100 0v12.5L87.5 0H100zm0 25v12.5L62.5 0h12.5L100 25zM75 0L0 75v-25L50 0h25zM0 0v25L25 0H0z" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#pattern)" />
              </svg>
            </div>
            
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md">
                Discover Your Next Favorite Manga
              </h1>
              <p className="text-lg md:text-xl mb-6 max-w-3xl opacity-90">
                Browse thousands of manga and manhwa titles from various sources, all in one place.
                Track your reading progress and get updates on new chapters.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/manga"
                  className="bg-white text-indigo-700 hover:bg-indigo-50 transition px-6 py-3 rounded-full font-semibold shadow-md"
                >
                  Browse Library
                </a>
                <a
                  href="/register"
                  className="bg-transparent hover:bg-white/20 text-white border border-white transition px-6 py-3 rounded-full font-semibold"
                >
                  Create Account
                </a>
              </div>
            </div>
          </div>

          {/* Latest releases section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Latest Updates</h2>
              <a href="/manga?sort=latest" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                View All
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {latestReleases.slice(0, 8).map((chapter, index) => (
                  <ChapterItem key={index} chapter={chapter} />
                ))}
              </div>
            </div>
          </section>

          {/* Popular manga section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Popular Manga</h2>
              <a href="/manga?sort=popularity" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                View All
              </a>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {popularManga.slice(0, 12).map((manga, index) => (
                <MangaCard key={index} manga={manga} />
              ))}
            </div>
          </section>

          {/* Browse by genre section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Browse by Genre</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {genres.map((genre, index) => (
                <a 
                  key={index}
                  href={`/manga/genre/${genre}`}
                  className="bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 transition shadow-sm rounded-xl p-4 flex items-center justify-between border border-gray-100 dark:border-gray-700"
                >
                  <span className="font-medium">{genre}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-indigo-500" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </a>
              ))}
            </div>
          </section>

          {/* Features section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Why Choose Our Platform</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="text-indigo-500 mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Vast Library</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access thousands of manga and manhwa titles from multiple sources in one convenient place.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="text-indigo-500 mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Customizable Reader</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Enjoy reading with our fluid reader that adapts to your preferences with multiple viewing modes.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="text-indigo-500 mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get notified when new chapters of your favorite series are released.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}