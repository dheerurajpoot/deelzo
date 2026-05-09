"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Copy,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { couponService } from "@/services/couponService";
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
      const allCoupons = await couponService.getCoupons();
      setCoupons(allCoupons);
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
        discountType: formData.discountType as any,
        discountValue: parseFloat(formData.discountValue),
        minimumAmount: parseFloat(formData.minimumAmount) || 0,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        validUntil: new Date(formData.validUntil).toISOString(),
        validFrom: new Date().toISOString(),
        applicableCategories: formData.applicableCategories
          .split(",")
          .map((cat) => cat.trim())
          .filter((cat) => cat),
        applicableProducts: formData.applicableProducts
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id),
      };

      await couponService.createCoupon(data);
      toast.success("Coupon created successfully!");
      setShowCreateDialog(false);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast.error("Failed to create coupon");
    }
  };

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return;

    try {
      const data = {
        code: formData.code,
        discountType: formData.discountType as any,
        discountValue: parseFloat(formData.discountValue),
        minimumAmount: parseFloat(formData.minimumAmount) || 0,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        isActive: editingCoupon.isActive,
        validUntil: new Date(formData.validUntil).toISOString(),
        applicableCategories: formData.applicableCategories
          .split(",")
          .map((cat) => cat.trim())
          .filter((cat) => cat),
        applicableProducts: formData.applicableProducts
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id),
      };

      await couponService.updateCoupon(editingCoupon._id, data);
      toast.success("Coupon updated successfully!");
      setShowEditDialog(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast.error("Failed to update coupon");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await couponService.deleteCoupon(id);
      toast.success("Coupon deleted successfully!");
      fetchCoupons();
    } catch (error: any) {
      toast.error("Failed to delete coupon");
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

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) return "inactive";
    if (now < validFrom) return "scheduled";
    if (now > validUntil) return "expired";
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return "used_up";
    return "active";
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getCouponStatus(coupon);
    const matchesStatus = filterStatus === "all" || filterStatus === status;
    return matchesSearch && matchesStatus;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  const getStatusBadge = (coupon: Coupon) => {
    const status = getCouponStatus(coupon);
    
    switch (status) {
      case "inactive":
        return <Badge variant="destructive" className="bg-rose-500/10 text-rose-600 border-rose-200">Inactive</Badge>;
      case "scheduled":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-200">Scheduled</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-200">Expired</Badge>;
      case "used_up":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">Used Up</Badge>;
      default:
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20">Active</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <AdminSidebar />

      <div className="flex-1 gap-3 md:ml-64 p-4 md:p-6 lg:p-8">
            <div className="flex flex-col mb-8 sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Promotions & Coupons</h1>
                <p className="text-slate-500 mt-1 font-medium">Manage discounts and rewards for your customers</p>
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
                    <div className="w-full sm:w-64">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">All Coupons</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="used_up">Used Up</SelectItem>
                        <SelectItem value="inactive">Manually Disabled</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>
                </CardContent>
            </Card>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoupons.length === 0 ? (
                <Card className="border-slate-200 col-span-full">
                    <CardContent className="p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Tag className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No coupons found</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                        {searchTerm ? "We couldn't find any coupons matching your search. Try adjusting your keywords." : "Start growing your sales by creating your first promotional coupon today."}
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
                    <Card key={coupon._id} className="border-slate-200 shadow-xl shadow-slate-200/20 hover:shadow-orange-500/10 transition-all duration-300 group overflow-hidden">
                      {/* Decorative sidebar color */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        getCouponStatus(coupon) === 'active' ? 'bg-emerald-500' : 
                        getCouponStatus(coupon) === 'inactive' ? 'bg-rose-500' : 
                        getCouponStatus(coupon) === 'scheduled' ? 'bg-blue-500' : 'bg-slate-300'
                      }`} />

                    <CardContent className="p-0">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight select-all">{coupon.code}</h3>
                                        <button 
                                          onClick={() => handleCopyCode(coupon.code)}
                                          className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
                                          title="Copy Code"
                                        >
                                          <Copy size={14} />
                                        </button>
                                    </div>
                                    {getStatusBadge(coupon)}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-orange-600 uppercase tracking-wider">
                                        {coupon.discountType === "percentage" ? "Percentage" : "Cash Discount"}
                                    </p>
                                    <p className="text-3xl font-black text-slate-900">
                                        {coupon.discountType === "percentage" 
                                            ? `${coupon.discountValue}%` 
                                            : `$${coupon.discountValue}`}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Usage Progress */}
                                <div>
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                                        <span>Redemption Rate</span>
                                        <span>{coupon.usedCount} / {coupon.usageLimit || "∞"}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${
                                            getCouponStatus(coupon) === 'used_up' ? 'bg-amber-500' : 'bg-orange-500'
                                          }`}
                                          style={{ 
                                            width: coupon.usageLimit 
                                              ? `${(coupon.usedCount / coupon.usageLimit) * 100}%` 
                                              : `${Math.min(coupon.usedCount * 5, 100)}%` 
                                          }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <Calendar size={12} className="text-slate-400" /> Valid Until
                                        </p>
                                        <p className="text-xs font-black text-slate-700">
                                            {new Date(coupon.validUntil).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <ShoppingBag size={12} className="text-slate-400" /> Min. Spend
                                        </p>
                                        <p className="text-xs font-black text-slate-700">
                                            ${coupon.minimumAmount || "0"}
                                        </p>
                                    </div>
                                </div>

                                {coupon.maximumDiscount && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-[11px] font-bold">
                                        <CheckCircle2 size={12} />
                                        Max Discount: ${coupon.maximumDiscount}
                                    </div>
                                )}

                                {(coupon.applicableCategories.length > 0 || coupon.applicableProducts.length > 0) && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-[11px] font-bold overflow-hidden">
                                        <Layers size={12} className="shrink-0" />
                                        <span className="truncate">
                                            Valid for {coupon.applicableCategories.length || coupon.applicableProducts.length} specific rules
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center bg-slate-50 border-t border-slate-100 divide-x divide-slate-200">
                            <button
                              onClick={() => handleEditCoupon(coupon)}
                              className="flex-1 py-4 text-xs font-black text-slate-600 hover:text-orange-600 hover:bg-white transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon._id)}
                              className="flex-1 py-4 text-xs font-black text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
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