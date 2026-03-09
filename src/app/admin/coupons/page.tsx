"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import AdminSidebar from "@/components/admin-sidebar";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumAmount: number;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  applicableCategories: string[];
  applicableProducts: string[];
  createdAt: string;
  updatedAt: string;
}

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minimumAmount: "",
    maximumDiscount: "",
    usageLimit: "",
    validUntil: "",
    applicableCategories: "",
    applicableProducts: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/coupons");
      if (response.data.success) {
        setCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    try {
      const data = {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minimumAmount: parseFloat(formData.minimumAmount) || 0,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        validUntil: formData.validUntil,
        applicableCategories: formData.applicableCategories
          .split(",")
          .map((cat) => cat.trim())
          .filter((cat) => cat),
        applicableProducts: formData.applicableProducts
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id),
      };

      const response = await axios.post("/api/coupons", data);
      
      if (response.data.success) {
        toast.success("Coupon created successfully!");
        setShowCreateDialog(false);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(response.data.message || "Failed to create coupon");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return;

    try {
      const data = {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minimumAmount: parseFloat(formData.minimumAmount) || 0,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        isActive: editingCoupon.isActive,
        validUntil: formData.validUntil,
        applicableCategories: formData.applicableCategories
          .split(",")
          .map((cat) => cat.trim())
          .filter((cat) => cat),
        applicableProducts: formData.applicableProducts
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id),
      };

      const response = await axios.put(`/api/coupons/${editingCoupon._id}`, data);
      
      if (response.data.success) {
        toast.success("Coupon updated successfully!");
        setShowEditDialog(false);
        setEditingCoupon(null);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(response.data.message || "Failed to update coupon");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update coupon");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await axios.delete(`/api/coupons/${id}`);
      
      if (response.data.success) {
        toast.success("Coupon deleted successfully!");
        fetchCoupons();
      } else {
        toast.error(response.data.message || "Failed to delete coupon");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minimumAmount: coupon.minimumAmount.toString(),
      maximumDiscount: coupon.maximumDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      validUntil: coupon.validUntil.split("T")[0],
      applicableCategories: coupon.applicableCategories.join(", "),
      applicableProducts: coupon.applicableProducts.join(", "),
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minimumAmount: "",
      maximumDiscount: "",
      usageLimit: "",
      validUntil: "",
      applicableCategories: "",
      applicableProducts: "",
    });
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && coupon.isActive) ||
                         (filterStatus === "inactive" && !coupon.isActive);
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }

    if (now < validFrom) {
      return <Badge variant="secondary">Scheduled</Badge>;
    }

    if (now > validUntil) {
      return <Badge variant="outline">Expired</Badge>;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return <Badge variant="outline">Used Up</Badge>;
    }

    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>;
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <AdminSidebar />

      <div className="flex-1 gap-3 md:ml-64 p-4 md:p-6 lg:p-8">
            <div className="flex flex-col mb-4 sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                <h1 className="text-3xl font-bold text-slate-900">Coupon Management</h1>
                <p className="text-slate-600 mt-1">Create and manage discount coupons</p>
                </div>
                <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
                >
                <Plus className="mr-2 h-4 w-4" />
                Create Coupon
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-slate-200 mb-4">
                <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                        placeholder="Search coupons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    </div>
                    <div className="w-full sm:w-48">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>
                </CardContent>
            </Card>

            {/* Coupons List */}
            <div className="grid gap-4">
                {filteredCoupons.length === 0 ? (
                <Card className="border-slate-200">
                    <CardContent className="p-12 text-center">
                    <Tag className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No coupons found</h3>
                    <p className="text-slate-500 mb-4">
                        {searchTerm ? "Try adjusting your search terms" : "Create your first coupon to get started"}
                    </p>
                    {!searchTerm && (
                        <Button 
                        onClick={() => setShowCreateDialog(true)}
                        className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
                        >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Coupon
                        </Button>
                    )}
                    </CardContent>
                </Card>
                ) : (
                filteredCoupons.map((coupon) => (
                    <Card key={coupon._id} className="border-slate-200 hover:border-orange-300 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900">{coupon.code}</h3>
                            {getStatusBadge(coupon)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <p className="text-sm text-slate-500">Discount</p>
                                <p className="font-semibold text-slate-900">
                                {coupon.discountType === "percentage" 
                                    ? `${coupon.discountValue}%` 
                                    : `$${coupon.discountValue}`}
                                </p>
                            </div>
                            
                            <div>
                                <p className="text-sm text-slate-500">Usage</p>
                                <p className="font-semibold text-slate-900">
                                {coupon.usedCount} / {coupon.usageLimit || "∞"}
                                </p>
                            </div>
                            
                            <div>
                                <p className="text-sm text-slate-500">Valid Until</p>
                                <p className="font-semibold text-slate-900">
                                {new Date(coupon.validUntil).toLocaleDateString()}
                                </p>
                            </div>
                            </div>
                            
                            {coupon.minimumAmount > 0 && (
                            <div className="mt-2">
                                <p className="text-sm text-slate-500">Minimum Order: ${coupon.minimumAmount}</p>
                            </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCoupon(coupon)}
                            >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                            </Button>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                            </Button>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                ))
                )}
            </div>

            {/* Create Coupon Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Coupon</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="code">Coupon Code *</Label>
                        <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        placeholder="e.g., SAVE20"
                        maxLength={20}
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="discountType">Discount Type *</Label>
                        <Select 
                        value={formData.discountType} 
                        onValueChange={(value) => setFormData({...formData, discountType: value})}
                        >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="discountValue">Discount Value *</Label>
                        <Input
                        id="discountValue"
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                        placeholder={formData.discountType === "percentage" ? "20" : "10"}
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="minimumAmount">Minimum Order Amount</Label>
                        <Input
                        id="minimumAmount"
                        type="number"
                        value={formData.minimumAmount}
                        onChange={(e) => setFormData({...formData, minimumAmount: e.target.value})}
                        placeholder="0"
                        />
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="maximumDiscount">
                        {formData.discountType === "percentage" ? "Maximum Discount" : "Not applicable"}
                        </Label>
                        <Input
                        id="maximumDiscount"
                        type="number"
                        value={formData.maximumDiscount}
                        onChange={(e) => setFormData({...formData, maximumDiscount: e.target.value})}
                        placeholder={formData.discountType === "percentage" ? "50" : "N/A"}
                        disabled={formData.discountType === "fixed"}
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="usageLimit">Usage Limit</Label>
                        <Input
                        id="usageLimit"
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                        placeholder="No limit"
                        />
                    </div>
                    </div>
                    
                    <div>
                    <Label htmlFor="validUntil">Valid Until *</Label>
                    <Input
                        id="validUntil"
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    />
                    </div>
                    
                    <div>
                    <Label htmlFor="applicableCategories">Applicable Categories (comma-separated)</Label>
                    <Input
                        id="applicableCategories"
                        value={formData.applicableCategories}
                        onChange={(e) => setFormData({...formData, applicableCategories: e.target.value})}
                        placeholder="e.g., electronics, clothing"
                    />
                    </div>
                    
                    <div>
                    <Label htmlFor="applicableProducts">Applicable Product IDs (comma-separated)</Label>
                    <Textarea
                        id="applicableProducts"
                        value={formData.applicableProducts}
                        onChange={(e) => setFormData({...formData, applicableProducts: e.target.value})}
                        placeholder="Enter product IDs separated by commas"
                        rows={3}
                    />
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                    </Button>
                    <Button 
                    onClick={handleCreateCoupon}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
                    >
                    Create Coupon
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Coupon Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Coupon</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="edit-code">Coupon Code *</Label>
                        <Input
                        id="edit-code"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        placeholder="e.g., SAVE20"
                        maxLength={20}
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="edit-discountType">Discount Type *</Label>
                        <Select 
                        value={formData.discountType} 
                        onValueChange={(value) => setFormData({...formData, discountType: value})}
                        >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    </div>
                    
                    {/* Rest of the form fields similar to create dialog */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="edit-discountValue">Discount Value *</Label>
                        <Input
                        id="edit-discountValue"
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                        placeholder={formData.discountType === "percentage" ? "20" : "10"}
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="edit-minimumAmount">Minimum Order Amount</Label>
                        <Input
                        id="edit-minimumAmount"
                        type="number"
                        value={formData.minimumAmount}
                        onChange={(e) => setFormData({...formData, minimumAmount: e.target.value})}
                        placeholder="0"
                        />
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="edit-maximumDiscount">
                        {formData.discountType === "percentage" ? "Maximum Discount" : "Not applicable"}
                        </Label>
                        <Input
                        id="edit-maximumDiscount"
                        type="number"
                        value={formData.maximumDiscount}
                        onChange={(e) => setFormData({...formData, maximumDiscount: e.target.value})}
                        placeholder={formData.discountType === "percentage" ? "50" : "N/A"}
                        disabled={formData.discountType === "fixed"}
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="edit-usageLimit">Usage Limit</Label>
                        <Input
                        id="edit-usageLimit"
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                        placeholder="No limit"
                        />
                    </div>
                    </div>
                    
                    <div>
                    <Label htmlFor="edit-validUntil">Valid Until *</Label>
                    <Input
                        id="edit-validUntil"
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    />
                    </div>
                    
                    <div>
                    <Label htmlFor="edit-applicableCategories">Applicable Categories (comma-separated)</Label>
                    <Input
                        id="edit-applicableCategories"
                        value={formData.applicableCategories}
                        onChange={(e) => setFormData({...formData, applicableCategories: e.target.value})}
                        placeholder="e.g., electronics, clothing"
                    />
                    </div>
                    
                    <div>
                    <Label htmlFor="edit-applicableProducts">Applicable Product IDs (comma-separated)</Label>
                    <Textarea
                        id="edit-applicableProducts"
                        value={formData.applicableProducts}
                        onChange={(e) => setFormData({...formData, applicableProducts: e.target.value})}
                        placeholder="Enter product IDs separated by commas"
                        rows={3}
                    />
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                    </Button>
                    <Button 
                    onClick={handleUpdateCoupon}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
                    >
                    Update Coupon
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    </div>
  );
}