'use client';

import { useState, useEffect, useCallback } from 'react';
import PostCard from './PostCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  category: string;
  tags: string;
  published: boolean;
  likes: number;
  views: number;
  createdAt: string;
}

interface PostGridProps {
  onPostClick: (slug: string) => void;
  refreshKey?: number;
}

export default function PostGrid({ onPostClick, refreshKey }: PostGridProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      setError(null);

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`/api/posts?page=${pageNum}&limit=10&published=true`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }

      setTotal(data.pagination.total);
      setHasMore(pageNum < data.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('حدث خطأ أثناء تحميل المقالات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, false);
  }, [fetchPosts, refreshKey]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  };

  const retry = () => {
    setPage(1);
    fetchPosts(1, false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold mb-2">حدث خطأ</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={retry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">لا توجد مقالات بعد</h3>
        <p className="text-muted-foreground">سيتم إضافة مقالات جديدة قريباً</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onClick={() => onPostClick(post.slug)}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={loadingMore}
            className="min-w-[200px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري التحميل...
              </>
            ) : (
              `تحميل المزيد (${posts.length} من ${total})`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
