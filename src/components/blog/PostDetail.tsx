'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Heart, Eye, Calendar, Loader2, Share2, MessageCircle,
  Send, CheckCircle2, User, Check, Copy
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

// VisuallyHidden component for accessibility
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);

interface PostDetailProps {
  slug: string | null;
  onClose: () => void;
}

interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  replies: Comment[];
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl: string | null;
  imageAlt: string | null;
  category: string;
  tags: string | string[]; // Can be either JSON string or array
  published: boolean;
  likes: number;
  views: number;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

export default function PostDetail({ slug, onClose }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    content: '',
  });
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetch(`/api/posts/${slug}?incrementView=true`)
        .then(res => res.json())
        .then(data => {
          setPost(data);
          setLikeCount(data.likes);
          return fetch(`/api/likes?postId=${data.id}`);
        })
        .then(res => res.json())
        .then(data => {
          setLiked(data.hasLiked);
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      fetchComments(slug);
    }
  }, [slug]);

  const fetchComments = async (postSlug: string) => {
    setCommentsLoading(true);
    try {
      const postRes = await fetch(`/api/posts/${postSlug}`);
      const postData = await postRes.json();
      
      const res = await fetch(`/api/comments?postId=${postData.id}&approved=true`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post || likeLoading) return;
    
    setLikeLoading(true);
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.totalLikes);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = async () => {
    if (!post) return;

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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || commentSubmitting) return;

    setCommentSubmitting(true);
    setCommentSuccess(false);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          ...commentForm,
        }),
      });

      if (res.ok) {
        setCommentSuccess(true);
        setCommentForm({ name: '', email: '', content: '' });
        setTimeout(() => setCommentSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Safe parse tags - handle both JSON string and array formats
  const tags = post ? (() => {
    try {
      if (!post.tags) return [];
      // If already an array, return it directly
      if (Array.isArray(post.tags)) return post.tags;
      // If string, try to parse it
      if (typeof post.tags === 'string') {
        const parsed = JSON.parse(post.tags);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  })() : [];

  return (
    <Dialog open={!!slug} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Always render DialogTitle for accessibility */}
        <DialogHeader>
          {loading ? (
            <VisuallyHidden>
              <DialogTitle>جاري تحميل المقال...</DialogTitle>
            </VisuallyHidden>
          ) : post ? (
            <>
              <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight">
                {post.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {post.excerpt}
              </DialogDescription>
            </>
          ) : (
            <VisuallyHidden>
              <DialogTitle>المقال غير موجود</DialogTitle>
            </VisuallyHidden>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : post ? (
          <div className="flex flex-col flex-1 min-h-0 -mt-4">
            <div className="mb-4">
              <Badge className="mb-3">{post.category}</Badge>
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-6 pb-4">
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.createdAt), 'dd MMMM yyyy', { locale: ar })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.views} مشاهدة
                  </span>
                  <span className="flex items-center gap-1">
                    {formatDistanceToNow(new Date(post.createdAt), { 
                      addSuffix: true,
                      locale: ar 
                    })}
                  </span>
                </div>

                {/* Image */}
                {post.imageUrl && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={post.imageUrl}
                      alt={post.imageAlt || post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap text-base leading-relaxed">
                    {post.content}
                  </div>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-3">
                    {/* Like Button */}
                    <Button
                      variant={liked ? 'default' : 'outline'}
                      size="lg"
                      onClick={handleLike}
                      disabled={likeLoading}
                      className={`gap-2 ${liked ? 'bg-red-500 hover:bg-red-600 text-white' : 'hover:text-red-500 hover:border-red-500'}`}
                    >
                      <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''} ${likeLoading ? 'animate-pulse' : ''}`} />
                      <span className="font-bold">{likeCount}</span>
                      <span className="hidden sm:inline">{liked ? 'أعجبك' : 'إعجاب'}</span>
                    </Button>

                    {/* Share Button */}
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleShare}
                      className={`gap-2 ${copied ? 'text-green-500 border-green-500 bg-green-500/10' : 'hover:text-primary'}`}
                    >
                      {copied ? (
                        <>
                          <Check className="h-5 w-5" />
                          <span className="hidden sm:inline">تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="h-5 w-5" />
                          <span className="hidden sm:inline">مشاركة</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Comment Count */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-5 w-5" />
                    <span>{comments.length} تعليق</span>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg">التعليقات</h3>
                    <Badge variant="secondary">{comments.length}</Badge>
                  </div>

                  {/* Comment Form */}
                  {commentSuccess ? (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/10 text-accent mb-4">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>تم إرسال تعليقك بنجاح! سيتم مراجعته قريباً.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleCommentSubmit} className="space-y-3 mb-6 p-4 rounded-lg bg-muted/50">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Input
                            placeholder="اسمك *"
                            value={commentForm.name}
                            onChange={(e) => setCommentForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            type="email"
                            placeholder="بريدك الإلكتروني *"
                            value={commentForm.email}
                            onChange={(e) => setCommentForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <Textarea
                        placeholder="اكتب تعليقك..."
                        value={commentForm.content}
                        onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                        rows={3}
                        required
                      />
                      <Button type="submit" size="sm" disabled={commentSubmitting}>
                        {commentSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 ml-2" />
                            إرسال التعليق
                          </>
                        )}
                      </Button>
                    </form>
                  )}

                  {/* Comments List */}
                  {commentsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-4 rounded-lg bg-muted/30">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{comment.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.createdAt), { 
                                    addSuffix: true,
                                    locale: ar 
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{comment.content}</p>
                            </div>
                          </div>
                          
                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 mr-12 space-y-3 border-r-2 border-primary/20 pr-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="p-3 rounded-lg bg-background">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="text-xs">رد</Badge>
                                    <span className="font-medium text-sm">{reply.name}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      لا توجد تعليقات بعد. كن أول من يعلق!
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">المقال غير موجود</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
