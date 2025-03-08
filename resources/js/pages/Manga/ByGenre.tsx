import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import MangaCard from '@/components/MangaCard';
import { Manga } from '@/types/manga';

interface ByGenreProps {
  manga: Manga[];
  genre: string;
}

export default function ByGenre({ manga, genre }: ByGenreProps) {
  return (
    <AppLayout>
      <Head title={`${genre} Manga - MangaPulse`} />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {genre} Manga
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Browse manga in the {genre} genre
            </p>
          </div>
          
          {manga.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {manga.map((item, index) => (
                <MangaCard key={index} manga={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No manga found in the {genre} genre.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}