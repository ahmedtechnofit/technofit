'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Eye, Calendar, MessageCircle, ArrowLeft, Share2, Check, Copy } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ar } from 'date-fns/locale';

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

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse tags safely
  const tags = (() => {
    try {
      if (!post.tags) return [];
      if (Array.isArray(post.tags)) return post.tags;
      if (typeof post.tags === 'string') {
        const parsed = JSON.parse(post.tags);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  })();

  // Check if user already liked
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const res = await fetch(`/api/likes?postId=${post.id}`);
        if (res.ok) {
          const data = await res.json();
          setLiked(data.hasLiked);
        }
      } catch {
        // Ignore errors
      }
    };
    checkLikeStatus();
  }, [post.id]);

  // Handle like
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.totalLikes);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Handle comment - opens the post
  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClick();
  };

  // Handle share
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const url = `${window.location.origin}/?post=${post.slug}`;
    
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: url,
        });
        return;
      } catch {
        // User cancelled or error - fallback to clipboard
      }
    }
    
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Category colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'تكنولوجيا': 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      'رياضة': 'bg-green-500/20 text-green-600 dark:text-green-400',
      'تغذية': 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
      'لياقة': 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
      'كمال أجسام': 'bg-red-500/20 text-red-600 dark:text-red-400',
    };
    return colors[category] || 'bg-primary/20 text-primary';
  };

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer bg-card hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-md"
      onClick={onClick}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full tech-gradient flex items-center justify-center">
            <div className="text-center">
              <span className="text-white text-5xl font-black opacity-30">TF</span>
            </div>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-4 right-4 z-20">
          <Badge className={`${getCategoryColor(post.category)} backdrop-blur-md border-0 font-medium px-3 py-1`}>
            {post.category}
          </Badge>
        </div>

        {/* Stats Overlay */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
            <Eye className="h-3 w-3" />
            <span>{post.views}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3">
        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{format(new Date(post.createdAt), 'dd MMMM yyyy', { locale: ar })}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ar })}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors leading-relaxed">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="text-[10px] px-2 py-0.5 font-normal border-muted-foreground/20"
              >
                #{tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 font-normal border-muted-foreground/20"
              >
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Footer with Actions */}
      <div className="px-5 pb-5 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          {/* Like & Comment Buttons */}
          <div className="flex items-center gap-1">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`gap-1.5 h-8 px-3 transition-all ${liked ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10' : 'hover:text-red-500'}`}
            >
              <Heart className={`h-4 w-4 transition-all ${liked ? 'fill-current scale-110' : ''} ${isLikeLoading ? 'animate-pulse' : ''}`} />
              <span className="font-medium">{likeCount}</span>
            </Button>

            {/* Comment Button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-3 hover:text-primary hover:bg-primary/10"
              onClick={handleComment}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">علق</span>
            </Button>
          </div>

          {/* Share Button */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className={`h-8 px-3 gap-1.5 transition-all ${copied ? 'text-green-500 bg-green-500/10' : 'hover:text-primary hover:bg-primary/10'}`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="font-medium text-xs">تم النسخ</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  <span className="font-medium text-xs hidden sm:inline">شارك</span>
                </>
              )}
            </Button>

            {/* Read More Indicator */}
            <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all cursor-pointer">
              <span className="hidden sm:inline">اقرأ المزيد</span>
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
