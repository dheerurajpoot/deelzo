"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin-sidebar';
import {
  Package,
  Edit,
  Eye,
  Calendar,
  DollarSign,
  Tag,
  CheckCircle,
  Clock,
  Archive,
  TrendingUp,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Listing {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  thumbnail?: string;
  status: 'active' | 'sold' | 'draft' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt: string;
  views?: number;
  slug?: string;
  salesCount?: number;
  rating?: {
    average: number;
    count: number;
  };
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/user-listings');
        if (response.ok) {
          const data = await response.json();
          setListings(data.listings || []);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast.error('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'sold':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'draft':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="text-emerald-600" />;
      case 'sold':
        return <TrendingUp size={16} className="text-violet-600" />;
      case 'draft':
        return <Archive size={16} className="text-amber-600" />;
      case 'pending':
        return <Clock size={16} className="text-blue-600" />;
      case 'rejected':
        return <Archive size={16} className="text-rose-600" />;
      default:
        return <Package size={16} className="text-slate-600" />;
    }
  };

  const updateListingStatus = async (listingId: string, newStatus: 'draft' | 'sold' | 'pending') => {
    try {
      setUpdatingStatus(listingId);
      
      const response = await axios.put(`/api/listings/${listingId}`, {
        status: newStatus
      });

      if (response.data.success) {
        // Update the listing in state
        setListings(prev => prev.map(listing => 
          listing._id === listingId 
            ? { ...listing, status: newStatus, updatedAt: new Date().toISOString() }
            : listing
        ));
        toast.success(`Listing status updated to ${newStatus}`);
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <AdminSidebar role="user" />
      <div className="md:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Package className="text-orange-500" size={32} />
                My Listings
              </h1>
              <p className="text-slate-600 mt-2">
                Manage all your product listings in one place
              </p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/create-listing')}
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              + Add New Listing
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search listings..."
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
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
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
          ) : filteredListings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Product</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Price</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Stats</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredListings.map((listing) => (
                    <tr key={listing._id} className="hover:bg-slate-50 transition-colors">
                      {/* Product Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {listing.thumbnail || (listing.images && listing.images.length > 0) ? (
                              <img 
                                src={listing.thumbnail || listing.images[0]} 
                                alt={listing.title} 
                                className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                <Package className="text-slate-400" size={20} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate max-w-xs">
                              {listing.title}
                            </p>
                            <p className="text-sm text-slate-500 truncate max-w-xs">
                              {listing.description.substring(0, 60)}{listing.description.length > 60 ? '...' : ''}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                              <Calendar size={12} />
                              <span>Created {formatDate(listing.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 capitalize">
                            {listing.category}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-emerald-500" />
                          <span className="text-lg font-bold text-slate-900">
                            ${listing.price}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(listing.status)}
                          <Badge className={`capitalize px-3 py-1 font-medium border ${getStatusVariant(listing.status)}`}>
                            {listing.status}
                          </Badge>
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Eye size={14} className="text-slate-400" />
                            <span>{listing.views || 0} views</span>
                          </div>
                          {listing.salesCount !== undefined && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <TrendingUp size={14} className="text-slate-400" />
                              <span>{listing.salesCount} sales</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          {/* Status Update Dropdown */}
                          <select
                            value={listing.status}
                            onChange={(e) => updateListingStatus(listing._id, e.target.value as 'draft' | 'sold' | 'pending')}
                            disabled={updatingStatus === listing._id}
                            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                          >
                            <option value="draft">Set as Draft</option>
                            <option value="sold">Set as Sold</option>
                            <option value="pending">Set as Pending</option>
                          </select>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Link href={`/dashboard/edit-listing/${listing._id}`}>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                              >
                                <Edit size={14} className="mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Link href={`/listing/${listing.slug || listing._id}`} target="_blank">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                              >
                                <Eye size={14} className="mr-1" />
                                View
                              </Button>
                            </Link>
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
                <Package className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No listings found</h3>
              <p className="text-slate-600 max-w-md mx-auto mb-8">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Get started by creating your first product listing'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button 
                  onClick={() => router.push('/dashboard/create-listing')}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                >
                  Create Your First Listing
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
          ) : filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <div key={listing._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300">
                {/* Card Header */}
                <div className="p-5 pb-3">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {listing.thumbnail || (listing.images && listing.images.length > 0) ? (
                        <img 
                          src={listing.thumbnail || listing.images[0]} 
                          alt={listing.title} 
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <Package className="text-slate-400" size={20} />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-900 truncate">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {listing.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge className={`capitalize px-2 py-1 text-xs font-medium border ${getStatusVariant(listing.status)}`}>
                            {listing.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Tag size={14} className="text-slate-400" />
                          <span className="capitalize">{listing.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} className="text-emerald-500" />
                          <span className="font-semibold text-slate-900">${listing.price}</span>
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
                        <Eye size={14} className="text-slate-400" />
                        <span>{listing.views || 0} views</span>
                      </div>
                      {listing.salesCount !== undefined && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <TrendingUp size={14} className="text-slate-400" />
                          <span>{listing.salesCount} sales</span>
                        </div>
                      )}
                    </div>
                    <div className="text-slate-500 text-xs">
                      <Calendar size={12} className="inline mr-1" />
                      {formatDate(listing.createdAt)}
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
                        value={listing.status}
                        onChange={(e) => updateListingStatus(listing._id, e.target.value as 'draft' | 'sold' | 'pending')}
                        disabled={updatingStatus === listing._id}
                        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                      >
                        <option value="draft">Set as Draft</option>
                        <option value="sold">Set as Sold</option>
                        <option value="pending">Set as Pending</option>
                      </select>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/dashboard/edit-listing/${listing._id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/listing/${listing.slug || listing._id}`} target="_blank" className="flex-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No listings found</h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Get started by creating your first product listing'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button 
                  onClick={() => router.push('/dashboard/create-listing')}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm"
                >
                  Create Listing
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