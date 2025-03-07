import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import { Manga, Chapter, ChapterImage } from '@/types/manga';
import { Auth } from '@/types/user';

type ReadingMode = 'vertical' | 'horizontal' | 'double';

interface ReaderShowProps {
  manga: Manga;
  chapter: Chapter;
  images: ChapterImage[];
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  readingMode: ReadingMode;
  auth: Auth;
}

export default function Show({ 
  manga, 
  chapter, 
  images, 
  prevChapter, 
  nextChapter, 
  readingMode, 
  auth 
}: ReaderShowProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [mode, setMode] = useState<ReadingMode>(readingMode || 'vertical');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'vertical') return; // No keyboard nav in vertical mode
      
      if (e.key === 'ArrowRight' || e.key === 'd') {
        nextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        prevPage();
      } else if (e.key === 'f') {
        toggleFullScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, mode]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Update reading progress
  useEffect(() => {
    if (auth.user) {
      const updateProgress = debounce(() => {
        fetch(route('chapter.update-progress', { mangaId: manga.id, chapterId: chapter.id }), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify({
            page: currentPage,
            source: manga.source,
          }),
        });
      }, 2000);
      
      updateProgress();
      return () => updateProgress.cancel();
    }
  }, [currentPage]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement && readerRef.current) {
      readerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const nextPage = () => {
    if (currentPage < images.length) {
      setCurrentPage(currentPage + 1);
    } else if (nextChapter) {
      router.visit(route('chapter.show', {
        mangaId: manga.id,
        chapterId: nextChapter.id,
        source: manga.source,
        mode: mode,
      }));
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (prevChapter) {
      router.visit(route('chapter.show', {
        mangaId: manga.id,
        chapterId: prevChapter.id,
        source: manga.source,
        mode: mode,
      }));
    }
  };

  const handleModeChange = (newMode: ReadingMode) => {
    setMode(newMode);
    // Reset to first page when changing to horizontal mode to avoid confusion
    if (newMode !== 'vertical' && mode === 'vertical') {
      setCurrentPage(1);
    }
  };

  const renderHeader = () => (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm text-white p-4 transition-transform duration-300 ${
        showControls ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <Link 
            href={route('manga.show', { id: manga.id, source: manga.source })}
            className="flex items-center text-white hover:text-indigo-300 transition"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
            Back
          </Link>
          <h1 className="text-sm sm:text-base md:text-lg font-medium truncate max-w-xs sm:max-w-sm">
            {manga.title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={mode}
            onChange={(e) => handleModeChange(e.target.value as ReadingMode)}
            className="bg-gray-800 text-white text-xs sm:text-sm rounded-full border border-gray-700 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="vertical">Vertical Scroll</option>
            <option value="horizontal">Horizontal</option>
            <option value="double">Double Page</option>
          </select>
          
          <button
            onClick={toggleFullScreen}
            className="p-1 rounded-full hover:bg-gray-700 focus:outline-none transition"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullScreen ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" 
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm text-white p-4 transition-transform duration-300 ${
        showControls ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1 && !prevChapter}
            className={`px-4 py-2 rounded-full ${
              currentPage <= 1 && !prevChapter
                ? 'text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 transition'
            }`}
          >
            {currentPage <= 1 && prevChapter ? 'Previous Chapter' : 'Previous'}
          </button>
          
          <div className="text-center">
            {mode !== 'vertical' && (
              <span className="px-4 py-1 bg-gray-800/80 rounded-full text-sm">
                {currentPage} / {images.length}
              </span>
            )}
          </div>
          
          <button
            onClick={nextPage}
            disabled={currentPage >= images.length && !nextChapter}
            className={`px-4 py-2 rounded-full ${
              currentPage >= images.length && !nextChapter
                ? 'text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 transition'
            }`}
          >
            {currentPage >= images.length && nextChapter ? 'Next Chapter' : 'Next'}
          </button>
        </div>
        
        {mode !== 'vertical' && (
          <div className="w-full mt-3">
            <input
              type="range"
              min={1}
              max={images.length}
              value={currentPage}
              onChange={(e) => setCurrentPage(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderVerticalReader = () => (
    <div className="px-4 py-16 max-w-3xl mx-auto">
      <div className="space-y-2">
        {images.map((image, index) => (
          <div key={index} className="flex justify-center">
            <img
              src={image.url}
              alt={`Page ${image.index}`}
              className="max-w-full h-auto rounded-md shadow-sm"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-between items-center">
        {prevChapter && (
          <Link
            href={route('chapter.show', {
              mangaId: manga.id,
              chapterId: prevChapter.id,
              source: manga.source,
              mode: mode,
            })}
            className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
            Previous Chapter
          </Link>
        )}
        
        <div className="flex-1"></div>
        
        {nextChapter && (
          <Link
            href={route('chapter.show', {
              mangaId: manga.id,
              chapterId: nextChapter.id,
              source: manga.source,
              mode: mode,
            })}
            className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
          >
            Next Chapter
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 ml-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );

  const renderHorizontalReader = () => (
    <div className="flex justify-center items-center h-full">
      {images.length > 0 && currentPage <= images.length && (
        <img
          src={images[currentPage - 1].url}
          alt={`Page ${currentPage}`}
          className="max-h-full max-w-full object-contain"
          loading={currentPage === 1 ? "eager" : "lazy"}
        />
      )}
      
      {/* Left/Right click areas for navigation */}
      <div 
        className="absolute left-0 top-0 h-full w-1/3 cursor-pointer"
        onClick={prevPage}
      />
      <div 
        className="absolute right-0 top-0 h-full w-1/3 cursor-pointer"
        onClick={nextPage}
      />
    </div>
  );

  const renderDoublePageReader = () => {
    // If we're on the last page and it's odd, just show one page
    const isLastPageSingle = currentPage === images.length && images.length % 2 === 1;
    const showTwoPages = !isLastPageSingle && currentPage < images.length;
    
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex">
          {images.length > 0 && currentPage <= images.length && (
            <img
              src={images[currentPage - 1].url}
              alt={`Page ${currentPage}`}
              className="max-h-full max-w-full object-contain"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
              loading={currentPage === 1 ? "eager" : "lazy"}
            />
          )}
          
          {showTwoPages && images[currentPage] && (
            <img
              src={images[currentPage].url}
              alt={`Page ${currentPage + 1}`}
              className="max-h-full max-w-full object-contain"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
              loading="lazy"
            />
          )}
        </div>
        
        {/* Left/Right click areas for navigation */}
        <div 
          className="absolute left-0 top-0 h-full w-1/3 cursor-pointer"
          onClick={prevPage}
        />
        <div 
          className="absolute right-0 top-0 h-full w-1/3 cursor-pointer"
          onClick={nextPage}
        />
      </div>
    );
  };

  return (
    <div 
      ref={readerRef}
      className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative"
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(true)}
    >
      <Head title={`${chapter.title || 'Chapter ' + chapter.chapter} - ${manga.title}`} />
      
      {renderHeader()}
      
      <div className="min-h-screen">
        {mode === 'vertical' && renderVerticalReader()}
        {mode === 'horizontal' && renderHorizontalReader()}
        {mode === 'double' && renderDoublePageReader()}
      </div>
      
      {mode !== 'vertical' && renderFooter()}
    </div>
  );
}