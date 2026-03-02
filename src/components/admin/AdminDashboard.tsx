'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Loader2, Plus, Edit, Trash2, Upload, Database, Users, FileText,
  ImageIcon, AlertTriangle, CheckCircle2, Eye, Heart, Calendar, RefreshCw,
  MessageCircle, Check, X, Send, Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl: string | null;
  imageAlt: string | null;
  category: string;
  tags: string;
  published: boolean;
  likes: number;
  views: number;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: string;
  post?: { title: string };
  replies?: Comment[];
}

interface ImageItem {
  id: string;
  originalName: string;
  url: string;
  size: number;
  createdAt: string;
}

interface Stats {
  posts: { total: number; published: number; unpublished: number };
  contacts: number;
  images: number;
  likes: number;
  comments: { total: number; pending: number; approved: number };
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Post Editor State
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    imageAlt: '',
    category: '',
    tags: '',
    published: false,
    metaTitle: '',
    metaDescription: '',
    keywords: '',
  });
  
  // Reply State
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyName] = useState('TechnoFit');
  const [replyEmail] = useState('admin@technofit.com');
  
  // Cleanup State
  const [cleanupResult, setCleanupResult] = useState<{
    postsDeleted: number;
    contactsDeleted: number;
    imagesDeleted: number;
  } | null>(null);

  // Contact Detail State
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsRes, contactsRes, commentsRes, imagesRes, statsRes] = await Promise.all([
        fetch('/api/posts?limit=100'),
        fetch('/api/contacts?limit=100'),
        fetch('/api/comments?limit=100'),
        fetch('/api/images?limit=100'),
        fetch('/api/cleanup'),
      ]);
      
      const [postsData, contactsData, commentsData, imagesData, statsData] = await Promise.all([
        postsRes.json(),
        contactsRes.json(),
        commentsRes.json(),
        imagesRes.json(),
        statsRes.json(),
      ]);
      
      setPosts(postsData.posts || []);
      setContacts(contactsData.contacts || []);
      setComments(commentsData.comments || []);
      setImages(imagesData.images || []);
      setStats(statsData.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setPostForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      imageUrl: '',
      imageAlt: '',
      category: '',
      tags: '',
      published: false,
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    });
    setShowPostEditor(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl || '',
      imageAlt: post.imageAlt || '',
      category: post.category,
      tags: post.tags,
      published: post.published,
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    });
    setShowPostEditor(true);
  };

  const handleSavePost = async () => {
    try {
      const tagsArray = postForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const body = {
        ...postForm,
        tags: tagsArray,
      };

      if (editingPost) {
        await fetch(`/api/posts/${editingPost.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      
      setShowPostEditor(false);
      fetchData();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleDeletePost = async (slug: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
    
    try {
      await fetch(`/api/posts/${slug}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.image) {
        setPostForm(prev => ({ ...prev, imageUrl: data.image.url }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleCleanup = async (type: 'posts' | 'contacts' | 'images' | 'all') => {
    try {
      const res = await fetch('/api/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      setCleanupResult(data.results);
      fetchData();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
      await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleApproveComment = async (id: string, approved: boolean) => {
    try {
      await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved }),
      });
      fetchData();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
    
    try {
      await fetch(`/api/comments?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReplyToComment = async () => {
    if (!replyingTo || !replyContent.trim()) return;
    
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: replyingTo.postId,
          parentId: replyingTo.id,
          name: replyName,
          email: replyEmail,
          content: replyContent,
        }),
      });
      
      setReplyingTo(null);
      setReplyContent('');
      fetchData();
    } catch (error) {
      console.error('Error replying to comment:', error);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
    
    try {
      await fetch(`/api/images?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.posts.total || 0}</p>
                <p className="text-xs text-muted-foreground">مقال</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.contacts || 0}</p>
                <p className="text-xs text-muted-foreground">تواصل</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <MessageCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.comments?.total || 0}</p>
                <p className="text-xs text-muted-foreground">تعليق</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.comments?.pending || 0}</p>
                <p className="text-xs text-muted-foreground">بانتظار الموافقة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.likes || 0}</p>
                <p className="text-xs text-muted-foreground">إعجاب</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="posts">المقالات</TabsTrigger>
          <TabsTrigger value="comments">التعليقات</TabsTrigger>
          <TabsTrigger value="contacts">التواصل</TabsTrigger>
          <TabsTrigger value="images">الصور</TabsTrigger>
          <TabsTrigger value="cleanup">التنظيف</TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">إدارة المقالات</h3>
            <Button onClick={handleCreatePost} className="gap-2">
              <Plus className="h-4 w-4" />
              مقال جديد
            </Button>
          </div>
          
          <Card>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العنوان</TableHead>
                    <TableHead>التصنيف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>المشاهدات</TableHead>
                    <TableHead>الإعجابات</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {post.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.published ? 'default' : 'secondary'}>
                          {post.published ? 'منشور' : 'مسودة'}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.views}</TableCell>
                      <TableCell>{post.likes}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPost(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePost(post.slug)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">إدارة التعليقات</h3>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                {stats?.comments?.pending || 0} بانتظار الموافقة
              </Badge>
            </div>
          </div>
          
          <Card>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 p-4">
                {comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد تعليقات
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className={`p-4 rounded-lg border ${!comment.approved ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-border'}`}>
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>{comment.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{comment.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {comment.email}
                            </span>
                            <Badge variant={comment.approved ? 'default' : 'secondary'}>
                              {comment.approved ? 'معتمد' : 'بانتظار الموافقة'}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{comment.content}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            {!comment.approved && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproveComment(comment.id, true)}
                                className="gap-1"
                              >
                                <Check className="h-3 w-3" />
                                موافقة
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReplyingTo(comment);
                                setReplyContent('');
                              }}
                              className="gap-1"
                            >
                              <Send className="h-3 w-3" />
                              رد
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="gap-1 text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">رسائل التواصل</h3>
            <Button variant="outline" onClick={fetchData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>
          </div>

          <Card>
            <ScrollArea className="h-[400px]">
              {contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                  <p>لا توجد رسائل تواصل حتى الآن</p>
                </div>
              ) : (
                <div className="divide-y">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{contact.name}</span>
                            <Badge variant={contact.status === 'new' ? 'default' : 'secondary'} className="text-xs">
                              {contact.status === 'new' ? 'جديد' : contact.status === 'read' ? 'مقروء' : 'تم الرد'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                          {contact.subject && (
                            <p className="text-sm font-medium mt-1">{contact.subject}</p>
                          )}
                          {contact.message && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{contact.message}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {contact.phone && (
                              <span>📱 {contact.phone}</span>
                            )}
                            <span>
                              <Calendar className="h-3 w-3 inline ml-1" />
                              {format(new Date(contact.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContact(contact.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">الصور المرفوعة</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  <img
                    src={image.url}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <p className="text-xs truncate text-muted-foreground mb-2">
                    {image.originalName}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {(image.size / 1024).toFixed(1)} KB
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cleanup Tab */}
        <TabsContent value="cleanup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                التنظيف الذكي لقاعدة البيانات
              </CardTitle>
              <CardDescription>
                احذف البيانات القديمة (أقدم من 3 أشهر) لتوفير مساحة قاعدة البيانات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  سيتم حذف البيانات نهائياً. يُنصح بعمل نسخة احتياطية قبل المتابعة.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">حذف المقالات غير المنشورة القديمة</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    حذف المسودات الأقدم من 3 أشهر
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => handleCleanup('posts')}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف المقالات القديمة
                  </Button>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">حذف رسائل التواصل القديمة</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    حذف الرسائل الأقدم من 3 أشهر
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => handleCleanup('contacts')}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف الرسائل القديمة
                  </Button>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">حذف الصور غير المستخدمة</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    حذف الصور غير المرتبطة بمقالات
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => handleCleanup('images')}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف الصور غير المستخدمة
                  </Button>
                </Card>

                <Card className="p-4 border-destructive/50">
                  <h4 className="font-medium mb-2">تنظيف شامل</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    حذف جميع البيانات القديمة دفعة واحدة
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => handleCleanup('all')}
                    className="w-full"
                  >
                    <Database className="h-4 w-4 ml-2" />
                    تنظيف شامل
                  </Button>
                </Card>
              </div>

              {cleanupResult && (
                <Card className="bg-accent/10 border-accent">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span className="font-medium">تم التنظيف بنجاح!</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">مقالات محذوفة:</span>
                        <span className="font-bold mr-1">{cleanupResult.postsDeleted}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">رسائل محذوفة:</span>
                        <span className="font-bold mr-1">{cleanupResult.contactsDeleted}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">صور محذوفة:</span>
                        <span className="font-bold mr-1">{cleanupResult.imagesDeleted}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Post Editor Dialog */}
      <Dialog open={showPostEditor} onOpenChange={setShowPostEditor}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'تعديل المقال' : 'مقال جديد'}</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل المقال. الحقول المطلوبة محددة بـ *
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">العنوان *</Label>
              <Input
                className="col-span-3"
                value={postForm.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setPostForm(prev => ({ 
                    ...prev, 
                    title,
                    slug: prev.slug || generateSlug(title)
                  }));
                }}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">الرابط (Slug) *</Label>
              <Input
                className="col-span-3"
                value={postForm.slug}
                onChange={(e) => setPostForm(prev => ({ ...prev, slug: e.target.value }))}
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">التصنيف *</Label>
              <Input
                className="col-span-3"
                value={postForm.category}
                onChange={(e) => setPostForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="مثال: تحليل مباريات"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">الوصف المختصر *</Label>
              <Textarea
                className="col-span-3"
                value={postForm.excerpt}
                onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={2}
                placeholder="وصف مختصر للمقال..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">المحتوى *</Label>
              <Textarea
                className="col-span-3"
                value={postForm.content}
                onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                placeholder="محتوى المقال الكامل..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">الصورة</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={postForm.imageUrl}
                    onChange={(e) => setPostForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="رابط الصورة أو ارفع صورة..."
                    dir="ltr"
                  />
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 ml-2" />
                        رفع
                      </span>
                    </Button>
                  </label>
                </div>
                {postForm.imageUrl && (
                  <img
                    src={postForm.imageUrl}
                    alt="Preview"
                    className="w-32 h-20 object-cover rounded"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">وصف الصورة (Alt)</Label>
              <Input
                className="col-span-3"
                value={postForm.imageAlt}
                onChange={(e) => setPostForm(prev => ({ ...prev, imageAlt: e.target.value }))}
                placeholder="وصف الصورة للسيو..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">الوسوم</Label>
              <Input
                className="col-span-3"
                value={postForm.tags}
                onChange={(e) => setPostForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="وسم1, وسم2, وسم3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">منشور</Label>
              <Switch
                checked={postForm.published}
                onCheckedChange={(checked) => setPostForm(prev => ({ ...prev, published: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostEditor(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSavePost}>
              {editingPost ? 'حفظ التغييرات' : 'إنشاء المقال'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={!!replyingTo} onOpenChange={() => setReplyingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>الرد على التعليق</DialogTitle>
            <DialogDescription>
              الرد على تعليق {replyingTo?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">التعليق الأصلي:</p>
              <p className="text-sm mt-1">{replyingTo?.content}</p>
            </div>

            <Textarea
              placeholder="اكتب ردك هنا..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyingTo(null)}>
              إلغاء
            </Button>
            <Button onClick={handleReplyToComment} disabled={!replyContent.trim()}>
              <Send className="h-4 w-4 ml-2" />
              إرسال الرد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Detail Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الرسالة</DialogTitle>
            <DialogDescription>
              من: {selectedContact?.name} ({selectedContact?.email})
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium">{selectedContact.email}</p>
                </div>
                {selectedContact.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">الهاتف</p>
                    <p className="font-medium">{selectedContact.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">الحالة</p>
                  <Badge variant={selectedContact.status === 'new' ? 'default' : 'secondary'}>
                    {selectedContact.status === 'new' ? 'جديد' : selectedContact.status === 'read' ? 'مقروء' : 'تم الرد'}
                  </Badge>
                </div>
              </div>

              {selectedContact.subject && (
                <div>
                  <p className="text-sm text-muted-foreground">الموضوع</p>
                  <p className="font-medium">{selectedContact.subject}</p>
                </div>
              )}

              {selectedContact.message && (
                <div>
                  <p className="text-sm text-muted-foreground">الرسالة</p>
                  <div className="p-3 bg-muted rounded-lg mt-1">
                    <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(selectedContact.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    window.open(`mailto:${selectedContact.email}`, '_blank');
                  }}
                >
                  <Mail className="h-4 w-4 ml-2" />
                  رد بالإيميل
                </Button>
                {selectedContact.phone && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      window.open(`https://wa.me/${selectedContact.phone?.replace(/\D/g, '')}`, '_blank');
                    }}
                  >
                    رد واتساب
                  </Button>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedContact(null)}>
              إغلاق
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedContact) {
                  handleDeleteContact(selectedContact.id);
                  setSelectedContact(null);
                }
              }}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
