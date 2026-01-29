"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Users,
  Upload,
  Star,
  Quote,
  Eye,
  Loader2
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

interface Testimonial {
  _id?: string;
  name: string;
  location: string;
  avatar: string;
  content: string;
  rating: number;
  serviceType?: string;
  servicesType?: string;
  date: string;
  status: string;
  tripDetails?: string;
}

export default function TestimonialsPage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollPositionRef = useRef<number>(0);

  // Dynamic testimonials and service types from API
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Fetch testimonials and service types from API
  useEffect(() => {
    fetchTestimonials();
    fetchServiceTypes();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/testimonial');
      const result = await response.json();
      
      if (result.success) {
        setTestimonials(result.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch testimonials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: "Error",
        description: "Failed to fetch testimonials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceTypes = async () => {
    try {
      setServicesLoading(true);
      
      // First try to get unique service types from existing testimonials
      const testimonialsResponse = await fetch('/api/admin/testimonial');
      const testimonialsResult = await testimonialsResponse.json();
      
      let uniqueServices: string[] = [];
      
      if (testimonialsResult.success && testimonialsResult.data) {
        // Extract unique service types from testimonials
        const servicesFromTestimonials = testimonialsResult.data
          .map((t: any) => t.servicesType || t.serviceType)
          .filter((s: string) => s && s.trim().length > 0)
          .map((s: string) => s.trim());
        
        uniqueServices = [...new Set(servicesFromTestimonials)];
      }
      
      // Then try to get services from contact info
      const contactResponse = await fetch('/api/admin/contact');
      const contactResult = await contactResponse.json();
      
      if (contactResult.success && contactResult.data?.servicesOffered) {
        const servicesFromContact = contactResult.data.servicesOffered
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        
        // Combine both sources and remove duplicates
        uniqueServices = [...new Set([...uniqueServices, ...servicesFromContact])];
      }
      
      // If we have services from either source, use them
      if (uniqueServices.length > 0) {
        setServiceTypes(uniqueServices.sort());
      } else {
        // Fallback services
        setServiceTypes([
          "One-way Trip",
          "Round Trip", 
          "Airport Taxi",
          "Day Rental",
          "Hourly Package",
          "Local Pickup/Drop",
          "Tour Package",
          "Corporate Travel",
          "Wedding Transportation"
        ]);
      }
    } catch (error) {
      console.error('Error fetching service types:', error);
      // Fallback services
      setServiceTypes([
        "One-way Trip",
        "Round Trip", 
        "Airport Taxi",
        "Day Rental",
        "Hourly Package",
        "Local Pickup/Drop",
        "Tour Package",
        "Corporate Travel",
        "Wedding Transportation"
      ]);
    } finally {
      setServicesLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    content: "",
    rating: 5,
    avatar: "",
    status: "published",
    date: "",
    serviceType: "",
    tripDetails: "",
  });

  const handleEdit = (testimonial: Testimonial) => {
    scrollPositionRef.current = window.scrollY;
    
    setEditingId(testimonial._id || null);
    setSelectedFile(null);
    setPreviewUrl("");

    setFormData({
      name: testimonial.name || "",
      location: testimonial.location || "",
      content: testimonial.content || "",
      rating: testimonial.rating || 5,
      avatar: testimonial.avatar || "",
      status: testimonial.status || "published",
      date: testimonial.date
        ? new Date(testimonial.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      serviceType: testimonial.serviceType || testimonial.servicesType || "",
      tripDetails: testimonial.tripDetails || "",
    });

    if (testimonial.avatar) {
      setPreviewUrl(testimonial.avatar);
    }

    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsFormSubmitted(true);
    setIsSaving(true);
    
    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.location ||
        !formData.content ||
        !formData.serviceType
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Prepare form data for API
      const apiFormData = new FormData();
      apiFormData.append('name', formData.name.trim());
      apiFormData.append('location', formData.location.trim());
      apiFormData.append('content', formData.content.trim());
      apiFormData.append('rating', formData.rating.toString());
      apiFormData.append('servicesType', formData.serviceType.trim());
      apiFormData.append('date', formData.date || new Date().toISOString().split("T")[0]);
      apiFormData.append('status', formData.status);
      
      if (selectedFile) {
        apiFormData.append('avatar', selectedFile);
      }

      if (editingId) {
        // Update existing testimonial - implement PUT endpoint
        const response = await fetch(`/api/admin/testimonial/${editingId}`, {
          method: 'PUT',
          body: apiFormData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          await fetchTestimonials(); // Refresh the list
          toast({
            title: "Testimonial Updated",
            description: "Testimonial has been successfully updated.",
          });
        } else {
          throw new Error(result.message || 'Failed to update testimonial');
        }
      } else {
        // Add new testimonial
        const response = await fetch('/api/admin/testimonial', {
          method: 'POST',
          body: apiFormData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          await fetchTestimonials(); // Refresh the list
          toast({
            title: "Testimonial Added",
            description: "New testimonial has been successfully added.",
          });
        } else {
          throw new Error(result.message || 'Failed to add testimonial');
        }
      }

      handleCancel();
    } catch (error: any) {
      console.error("Error saving testimonial:", error);
      toast({
        title: "Error",
        description: "Failed to save testimonial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/testimonial/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchTestimonials(); // Refresh the list
        toast({
          title: "Testimonial Deleted",
          description: "Testimonial has been successfully deleted.",
        });
      } else {
        throw new Error(result.message || 'Failed to delete testimonial');
      }
      
      setDeletingId(null);
    } catch (error: any) {
      console.error("Error deleting testimonial:", error);
      toast({
        title: "Error",
        description: "Failed to delete testimonial. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    const savedScrollPosition = scrollPositionRef.current;
    
    setIsEditing(false);
    setEditingId(null);
    setSelectedFile(null);
    setPreviewUrl("");

    setFormData({
      name: "",
      location: "",
      content: "",
      rating: 5,
      avatar: "",
      status: "published",
      date: new Date().toISOString().split("T")[0],
      serviceType: "",
      tripDetails: "",
    });
    
    requestAnimationFrame(() => {
      window.scrollTo({ 
        top: savedScrollPosition, 
        behavior: "instant" 
      });
    });
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleAvatarUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid File Type",
            description: "Only JPEG, PNG, and WebP images are allowed.",
            variant: "destructive",
          });
          return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          toast({
            title: "File Too Large",
            description: "File size must be less than 5MB.",
            variant: "destructive",
          });
          return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        toast({
          title: "Image Selected",
          description: `${file.name} selected. Click Save to upload.`,
        });
      }
    };
    input.click();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={fadeInUp}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-admin-gradient bg-clip-text text-transparent">
            Testimonials Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage customer testimonials and reviews for mnt Tours & Travels
          </p>
        </div>
        <Dialog
          open={isEditing}
          onOpenChange={(open) => {
            if (!open) {
              setIsFormSubmitted(false);
              const savedScrollPosition = scrollPositionRef.current;
              handleCancel();
              
              setTimeout(() => {
                window.scrollTo({ 
                  top: savedScrollPosition, 
                  behavior: "instant" 
                });
              }, 50);
            } else {
              scrollPositionRef.current = window.scrollY;
            }
            setIsEditing(open);
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                scrollPositionRef.current = window.scrollY;
                setEditingId(null);
                setFormData({
                  name: "",
                  location: "",
                  content: "",
                  rating: 5,
                  avatar: "",
                  status: "published",
                  date: new Date().toISOString().split("T")[0],
                  serviceType: "",
                  tripDetails: "",
                });
                setSelectedFile(null);
                setPreviewUrl("");
                setIsEditing(true);
              }}
              className="bg-admin-gradient text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>          
<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-admin-gradient bg-clip-text text-transparent">
                {editingId ? "Edit Testimonial" : "Add New Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-8 p-6">
              {/* Customer Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold bg-admin-gradient bg-clip-text text-transparent">
                  Customer Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-base font-semibold">
                      Customer Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter customer name"
                      className={`mt-2 ${
                        isFormSubmitted && !formData.name
                          ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {isFormSubmitted && !formData.name && (
                      <p className="text-xs text-red-500 mt-1">
                        Name is required
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-base font-semibold">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="City, State"
                      className={`mt-2 ${
                        isFormSubmitted && !formData.location
                          ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {isFormSubmitted && !formData.location && (
                      <p className="text-xs text-red-500 mt-1">
                        Location is required
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Picture */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold bg-admin-gradient bg-clip-text text-transparent">
                  Profile Picture
                </h3>
                <div>
                  <Label className="text-base font-semibold">
                    Customer Photo
                  </Label>
                  <div className="mt-2 space-y-4">
                    {(formData.avatar || previewUrl) && (
                      <div className="flex items-center gap-4">
                        <img
                          src={previewUrl || formData.avatar || "/placeholder.svg"}
                          alt="Customer photo"
                          className="w-20 h-20 rounded-full border object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setFormData({ ...formData, avatar: "" });
                            setSelectedFile(null);
                            setPreviewUrl("");
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAvatarUpload}
                        className="flex items-center bg-transparent"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {selectedFile ? "Change Photo" : "Upload Photo"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold bg-admin-gradient bg-clip-text text-transparent">
                  Testimonial Content
                </h3>
                <div>
                  <Label htmlFor="content" className="text-base font-semibold">
                    Customer Review <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter the customer's review about our travel services..."
                    rows={6}
                    className={`mt-2 ${
                      isFormSubmitted && !formData.content
                        ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                        : ""
                    }`}
                  />
                  {isFormSubmitted && !formData.content && (
                    <p className="text-xs text-red-500 mt-1">
                      Review content is required
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold">Rating *</Label>
                    <Select
                      value={formData.rating.toString()}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          rating: Number.parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{rating}</span>
                              <div className="flex">{renderStars(rating)}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-base font-semibold">
                      Service Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, serviceType: value })
                      }
                    >
                      <SelectTrigger
                        className={`mt-2 ${
                          isFormSubmitted && !formData.serviceType
                            ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicesLoading ? (
                          <SelectItem value="" disabled>Loading services...</SelectItem>
                        ) : serviceTypes.length === 0 ? (
                          <SelectItem value="" disabled>No services available</SelectItem>
                        ) : (
                          serviceTypes.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {isFormSubmitted && !formData.serviceType && (
                      <p className="text-xs text-red-500 mt-1">
                        Service type is required
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="tripDetails" className="text-base font-semibold">
                      Trip Details
                    </Label>
                    <Input
                      id="tripDetails"
                      value={formData.tripDetails}
                      onChange={(e) =>
                        setFormData({ ...formData, tripDetails: e.target.value })
                      }
                      placeholder="e.g., Chennai to Bangalore"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date" className="text-base font-semibold">
                      Review Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold bg-admin-gradient bg-clip-text text-transparent">
                  Settings
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-admin-gradient text-white border-0"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Testimonial
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold bg-admin-gradient bg-clip-text text-transparent mb-2">
              {testimonials.length}
            </div>
            <div className="text-gray-600 text-sm font-medium">Total Reviews</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold bg-admin-gradient bg-clip-text text-transparent mb-2">
              {testimonials.filter(t => t.status === "published").length}
            </div>
            <div className="text-gray-600 text-sm font-medium">Published</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold bg-admin-gradient bg-clip-text text-transparent mb-2">
              {(testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)}
            </div>
            <div className="text-gray-600 text-sm font-medium">Avg Rating</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Quote className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold bg-admin-gradient bg-clip-text text-transparent mb-2">
              {testimonials.filter(t => t.rating === 5).length}
            </div>
            <div className="text-gray-600 text-sm font-medium">5-Star Reviews</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this testimonial? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  handleDelete(deletingId);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Testimonials List */}
      <div className="grid gap-6">
        {loading || servicesLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">
              {loading ? 'Loading testimonials...' : 'Loading services...'}
            </span>
          </div>
        ) : testimonials.length === 0 ? (
          <Card className="shadow-xl border-0">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Testimonials Found</h3>
              <p className="text-gray-500">Start by adding your first customer testimonial.</p>
            </CardContent>
          </Card>
        ) : (
          testimonials.map((testimonial) => (
          <Card
            key={testimonial._id}
            className="shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Avatar and Rating */}
                <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-2 flex-shrink-0">
                  <img
                    src={testimonial.avatar || "/images/placeholder-avatar.jpg"}
                    alt={testimonial.name}
                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-gradient-to-r from-blue-400 to-purple-500 object-cover"
                  />
                  <div className="lg:text-center">
                    <div className="flex justify-center mb-2">
                      {renderStars(testimonial.rating)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(testimonial.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {testimonial.location}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {testimonial.serviceType || testimonial.servicesType}
                        </Badge>
                        {testimonial.tripDetails && (
                          <Badge variant="outline" className="text-gray-600">
                            {testimonial.tripDetails}
                          </Badge>
                        )}
                        <Badge
                          variant={testimonial.status === "published" ? "default" : "secondary"}
                          className={
                            testimonial.status === "published"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {testimonial.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(testimonial)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(testimonial._id!)}
                        className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Testimonial Content */}
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 h-8 w-8 text-gray-200" />
                    <p className="text-gray-700 leading-relaxed pl-6 italic">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {testimonials.length === 0 && (
        <Card className="shadow-xl border-0">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-admin-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No testimonials found</h3>
            <p className="text-gray-600 mb-6">
              Add your first customer testimonial to showcase your travel services.
            </p>
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-admin-gradient text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}