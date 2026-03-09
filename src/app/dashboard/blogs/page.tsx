"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
	Loader2,
	Plus,
	Image as ImageIcon,
	Pencil,
	Trash2,
	FileText,
	Calendar,
	User,
	CheckCircle,
	Clock,
	XCircle,
	Eye,
	Search,
	Filter,
} from "lucide-react";
import Image from "next/image";
import { userContext } from "@/context/userContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin-sidebar";
import axios from "axios";

export default function UserBlogsPage() {
	const { user } = userContext();
	const router = useRouter();
	const [blogs, setBlogs] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");

	const fetchBlogs = async () => {
		if (!user) return;
		try {
			const res = await fetch(`/api/blogs?limit=100&userId=${user._id}`);
			const data = await res.json();
			if (data.success) {
				setBlogs(data.blogs);
			}
		} catch (error) {
			console.error("Failed to fetch blogs:", error);
			toast.error("Failed to load blogs");
		} finally {
			setLoading(false);
		}
	};

	const updateBlogStatus = async (blogId: string, newStatus: 'draft' | 'published' | 'rejected') => {
		try {
			const response = await axios.put(`/api/blogs/${blogId}`, {
				status: newStatus
			});

			if (response.data.success) {
				// Update the blog in state
				setBlogs(prev => prev.map(blog => 
					blog._id === blogId 
						? { ...blog, status: newStatus, updatedAt: new Date().toISOString() }
						: blog
				));
				toast.success(`Blog status updated to ${newStatus}`);
			} else {
				toast.error(response.data.message || 'Failed to update status');
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Failed to update status');
		}
		};

	const filteredBlogs = blogs.filter(blog => {
		const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
						 blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
						 blog.seo?.metaDescription?.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
		
		return matchesSearch && matchesStatus;
	});

	useEffect(() => {
		fetchBlogs();
	}, [user]);

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this blog?")) return;
		try {
			const res = await fetch(`/api/blogs/${id}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (data.success) {
				toast.success("Blog deleted successfully");
				setBlogs(blogs.filter(blog => blog._id !== id));
			} else {
				toast.error(data.message || "Failed to delete blog");
			}
		} catch (error) {
			toast.error("An error occurred");
		}
	};

	const getStatusVariant = (status: string) => {
		switch (status) {
			case 'published':
				return 'bg-emerald-100 text-emerald-800 border-emerald-200';
			case 'rejected':
				return 'bg-rose-100 text-rose-800 border-rose-200';
			case 'draft':
				return 'bg-amber-100 text-amber-800 border-amber-200';
			case 'pending':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			default:
				return 'bg-slate-100 text-slate-800 border-slate-200';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'published':
				return <CheckCircle size={16} className="text-emerald-600" />;
			case 'rejected':
				return <XCircle size={16} className="text-rose-600" />;
			case 'draft':
				return <FileText size={16} className="text-amber-600" />;
			case 'pending':
				return <Clock size={16} className="text-blue-600" />;
			default:
				return <FileText size={16} className="text-slate-600" />;
		}
	};

	const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <AdminSidebar role="user" />
      <div className="md:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <FileText className="text-orange-500" size={32} />
                My Blogs
              </h1>
              <p className="text-slate-600 mt-2">
                Manage your stories and drafts
              </p>
            </div>
            <Link href='/dashboard/add-blog'>
              <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium">
                <Plus size={16} className="mr-2" /> New Blog
              </Button>
            </Link>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="w-full md:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl animate-pulse">
                      <div className="w-16 h-16 bg-slate-200 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-1/3 bg-slate-200 rounded" />
                        <div className="h-4 w-2/3 bg-slate-200 rounded" />
                      </div>
                      <div className="h-8 w-24 bg-slate-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredBlogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Blog</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Author</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredBlogs.map((blog: any) => (
                      <tr key={blog._id} className="hover:bg-slate-50 transition-colors">
                        {/* Blog Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {blog.image ? (
                                <img 
                                  src={blog.image} 
                                  alt={blog.title} 
                                  className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                  <FileText className="text-slate-400" size={20} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 truncate max-w-xs">
                                {blog.title}
                              </p>
                              <p className="text-sm text-slate-500 truncate max-w-xs">
                                {blog.seo?.metaDescription || blog.content.replace(/<[^>]*>?/gm, "").substring(0, 60)}{blog.content.replace(/<[^>]*>?/gm, "").length > 60 ? '...' : ''}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                <Calendar size={12} />
                                <span>Created {formatDate(blog.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(blog.status)}
                            <Badge className={`capitalize px-3 py-1 font-medium border ${getStatusVariant(blog.status)}`}>
                              {blog.status}
                            </Badge>
                          </div>
                        </td>

                        {/* Author */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">
                              {user?.name || 'Unknown'}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {formatDate(blog.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-2 min-w-[140px]">
                            {/* Status Update Dropdown */}
                            <select
                              value={blog.status}
                              onChange={(e) => updateBlogStatus(blog._id, e.target.value as 'draft' | 'published' | 'rejected')}
                              className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="draft">Set as Draft</option>
                              <option value="published">Set as Published</option>
                              <option value="rejected">Set as Rejected</option>
                            </select>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Link href={`/dashboard/add-blog?id=${blog._id}`}>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                                >
                                  <Pencil size={14} className="mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                                onClick={() => handleDelete(blog._id)}
                              >
                                <Trash2 size={14} className="mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No blogs found</h3>
                <p className="text-slate-600 max-w-md mx-auto mb-8">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Get started by creating your first blog post'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button 
                    onClick={() => router.push('/dashboard/add-blog')}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                  >
                    Create Your First Blog
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-200 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 w-3/4 bg-slate-200 rounded" />
                        <div className="h-4 w-full bg-slate-200 rounded" />
                        <div className="h-4 w-1/2 bg-slate-200 rounded" />
                        <div className="flex justify-between pt-3">
                          <div className="h-8 w-20 bg-slate-200 rounded" />
                          <div className="h-8 w-16 bg-slate-200 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog: any) => (
                <div key={blog._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300">
                  {/* Card Header */}
                  <div className="p-5 pb-3">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {blog.image ? (
                          <img 
                            src={blog.image} 
                            alt={blog.title} 
                            className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <FileText className="text-slate-400" size={20} />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900 truncate">
                              {blog.title}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                              {blog.seo?.metaDescription || blog.content.replace(/<[^>]*>?/gm, "")}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Badge className={`capitalize px-2 py-1 text-xs font-medium border ${getStatusVariant(blog.status)}`}>
                              {blog.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <User size={14} className="text-slate-400" />
                            <span className="capitalize">{user?.name || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Bar */}
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-slate-500 text-xs">
                        <Calendar size={12} className="inline mr-1" />
                        {formatDate(blog.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="p-5 pt-4 border-t border-slate-100">
                    <div className="space-y-3">
                      {/* Status Update */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-2">Update Status</label>
                        <select
                          value={blog.status}
                          onChange={(e) => updateBlogStatus(blog._id, e.target.value as 'draft' | 'published' | 'rejected')}
                          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="draft">Set as Draft</option>
                          <option value="published">Set as Published</option>
                          <option value="rejected">Set as Rejected</option>
                        </select>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link href={`/dashboard/add-blog?id=${blog._id}`} className="flex-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                          >
                            <Pencil size={14} className="mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                          onClick={() => handleDelete(blog._id)}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No blogs found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Get started by creating your first blog post'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button 
                    onClick={() => router.push('/dashboard/add-blog')}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm"
                  >
                    Create Blog
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
