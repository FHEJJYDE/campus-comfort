import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Eye, Trash2, Search, FileText, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featured_image?: string;
    status: string;
    category?: string;
    tags?: string[];
    is_featured: boolean;
    views_count: number;
    published_at?: string;
    created_at: string;
    author_id?: string;
    profiles?: {
        full_name: string;
    };
}

const BlogManagement = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        status: 'draft',
        category: '',
        tags: '',
        is_featured: false
    });

    useEffect(() => {
        fetchBlogPosts();
    }, []);

    const fetchBlogPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select(`
          *,
          profiles (
            full_name
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            toast.error('Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const slug = formData.slug || generateSlug(formData.title);
            const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [];

            const postData = {
                ...formData,
                slug,
                tags,
                author_id: user?.id,
                published_at: formData.status === 'published' ? new Date().toISOString() : null
            };

            if (editingPost) {
                const { error } = await supabase
                    .from('blog_posts')
                    .update(postData)
                    .eq('id', editingPost.id);

                if (error) throw error;
                toast.success('Blog post updated successfully');
            } else {
                const { error } = await supabase
                    .from('blog_posts')
                    .insert([postData]);

                if (error) throw error;
                toast.success('Blog post created successfully');
            }

            setIsCreateDialogOpen(false);
            setEditingPost(null);
            resetForm();
            fetchBlogPosts();
        } catch (error) {
            console.error('Error saving blog post:', error);
            toast.error('Failed to save blog post');
        }
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            content: post.content,
            featured_image: post.featured_image || '',
            status: post.status,
            category: post.category || '',
            tags: post.tags?.join(', ') || '',
            is_featured: post.is_featured
        });
        setIsCreateDialogOpen(true);
    };

    const handleDelete = async (post: BlogPost) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;

        try {
            const { error } = await supabase
                .from('blog_posts')
                .delete()
                .eq('id', post.id);

            if (error) throw error;

            toast.success('Blog post deleted successfully');
            fetchBlogPosts();
        } catch (error) {
            console.error('Error deleting blog post:', error);
            toast.error('Failed to delete blog post');
        }
    };

    const toggleFeatured = async (post: BlogPost) => {
        try {
            const { error } = await supabase
                .from('blog_posts')
                .update({ is_featured: !post.is_featured })
                .eq('id', post.id);

            if (error) throw error;

            toast.success(`Post ${!post.is_featured ? 'featured' : 'unfeatured'}`);
            fetchBlogPosts();
        } catch (error) {
            console.error('Error updating featured status:', error);
            toast.error('Failed to update featured status');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            featured_image: '',
            status: 'draft',
            category: '',
            tags: '',
            is_featured: false
        });
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-realty-gold"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-realty-gold" />
                                Blog Management
                            </CardTitle>
                            <CardDescription>
                                Create and manage blog posts for Campus Comfort
                            </CardDescription>
                        </div>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => { resetForm(); setEditingPost(null); }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Post
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editingPost ? 'Update blog post information' : 'Create a new blog post for Campus Comfort'}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="title">Title *</Label>
                                            <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(e) => {
                                                    const title = e.target.value;
                                                    setFormData({
                                                        ...formData,
                                                        title,
                                                        slug: formData.slug || generateSlug(title)
                                                    });
                                                }}
                                                placeholder="Enter blog post title"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="slug">Slug</Label>
                                            <Input
                                                id="slug"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                placeholder="auto-generated-from-title"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="excerpt">Excerpt</Label>
                                        <Textarea
                                            id="excerpt"
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            placeholder="Brief description of the blog post..."
                                            rows={2}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="content">Content *</Label>
                                        <Textarea
                                            id="content"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="Write your blog post content here..."
                                            rows={10}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="featured_image">Featured Image URL</Label>
                                        <Input
                                            id="featured_image"
                                            type="url"
                                            value={formData.featured_image}
                                            onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="status">Status</Label>
                                            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="published">Published</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="category">Category</Label>
                                            <Input
                                                id="category"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                placeholder="Student Life, Housing Tips, etc."
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2 pt-6">
                                            <Switch
                                                id="is_featured"
                                                checked={formData.is_featured}
                                                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                                            />
                                            <Label htmlFor="is_featured">Featured Post</Label>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                                        <Input
                                            id="tags"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            placeholder="student housing, campus life, tips"
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            {editingPost ? 'Update' : 'Create'} Post
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search posts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Views</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPosts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                    {post.title}
                                                    {post.is_featured && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Featured
                                                        </Badge>
                                                    )}
                                                </div>
                                                {post.excerpt && (
                                                    <div className="text-sm text-gray-500 line-clamp-1">
                                                        {post.excerpt}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                {post.profiles?.full_name || 'Unknown'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                post.status === 'published' ? 'default' :
                                                    post.status === 'draft' ? 'secondary' : 'outline'
                                            }>
                                                {post.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {post.category && (
                                                <Badge variant="outline">{post.category}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-4 w-4 text-gray-400" />
                                                {post.views_count}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(post)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Switch
                                                    checked={post.is_featured}
                                                    onCheckedChange={() => toggleFeatured(post)}
                                                    size="sm"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(post)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm || statusFilter !== 'all' ? 'No blog posts found matching your criteria.' : 'No blog posts created yet.'}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default BlogManagement;