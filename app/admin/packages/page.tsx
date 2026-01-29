"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import RichTextEditor from "@/components/ui/rich-text-editor";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Package,
  Upload,
  ImageIcon,
  Loader2,
  MapPin,
  Calendar
} from "lucide-react";
import axios from "axios";
import "@/styles/quill.css";

interface TourPackage {
  _id?: string;
  title: string;
  destination: string;
  shortDescription: string;
  fullDescription: string;
  duration: string;
  price: string;
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  image: string;
  gallery: string[];
  status: string;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  itinerary: DayPlan[];
}

interface DayPlan {
  day: string;
  title: string;
  description: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalPackages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PackagesPage() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingButtonId, setDeletingButtonId] = useState<string | null>(null);
  const scrollPositionRef = useRef<number>(0);

  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalPackages: 0,
    limit: 6,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    shortDescription: "",
    fullDescription: "",
    duration: "",
    price: "",
    inclusions: "",
    exclusions: "",
    highlights: "",
    image: "",
    gallery: [] as string[],
    status: "active",
    featured: false,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  // Check if maximum featured packages limit reached (3 featured packages max)
  const maxFeaturedReached =
    Array.isArray(packages) && packages.filter((pkg) => pkg.featured).length >= 3;

  const [dayPlans, setDayPlans] = useState<DayPlan[]>([
    { day: "1", title: "", description: "" },
  ]);

  // Quill configuration
  const quillModules = {
    toolbar: {
      container: [[{ list: "ordered" }, { list: "bullet" }], ["clean"]],
    },
  };

  const quillFormats = ["list", "bullet"];

  // Helper function to check if ReactQuill content is empty
  const isQuillContentEmpty = (content: string) => {
    if (!content) return true;
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    return textContent === "";
  };

  // Fetch packages from API
  const fetchPackages = async (page = 1) => {
    try {
      setLoading(true);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.get(`/api/admin/packages?page=${page}&limit=6`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setPackages(response.data.data);
        setPagination(response.data.pagination);
        setCurrentPage(page);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch packages",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages(currentPage);
  }, [currentPage]);

  const handleEdit = (pkg: TourPackage) => {
    scrollPositionRef.current = window.scrollY;
    
    setEditingId(pkg._id || null);
    setFormData({
      title: pkg.title,
      destination: pkg.destination,
      shortDescription: pkg.shortDescription,
      fullDescription: pkg.fullDescription,
      duration: pkg.duration,
      price: pkg.price,
      inclusions: pkg.inclusions.join(", "),
      exclusions: pkg.exclusions.join(", "),
      highlights: pkg.highlights.join(", "),
      image: pkg.image,
      gallery: pkg.gallery || [],
      status: pkg.status,
      featured: pkg.featured,
      seoTitle: pkg.seoTitle || "",
      seoDescription: pkg.seoDescription || "",
      seoKeywords: pkg.seoKeywords || "",
    });
    setDayPlans(pkg.itinerary || [{ day: "1", title: "", description: "" }]);
    setSelectedFiles({
      mainImage: null,
      galleryImages: [],
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    setIsFormSubmitted(true);
    setIsSaving(true);

    // Validate required fields
    if (
      !formData.title ||
      !formData.destination ||
      !formData.image
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Destination, Main Image).",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    try {
      // Get JWT token from localStorage first
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again to continue.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Prepare form data for submission (including files)
      const submitFormData = new FormData();
      
      // Add all text fields
      submitFormData.append('title', formData.title.trim());
      submitFormData.append('destination', formData.destination.trim());
      submitFormData.append('shortDescription', formData.shortDescription.trim());
      submitFormData.append('fullDescription', formData.fullDescription.trim());
      submitFormData.append('duration', formData.duration.trim());
      submitFormData.append('price', formData.price.trim());
      submitFormData.append('featured', formData.featured.toString());
      submitFormData.append('status', formData.status);
      
      // Add existing image URL if no new file selected
      if (!selectedFiles.mainImage && formData.image) {
        submitFormData.append('existingImage', formData.image);
      }
      
      // Add new main image file if selected
      if (selectedFiles.mainImage) {
        submitFormData.append('mainImage', selectedFiles.mainImage);
      }
      
      // Add existing gallery URLs
      formData.gallery.forEach((url, index) => {
        if (!url.startsWith('blob:')) {
          submitFormData.append(`existingGallery[${index}]`, url);
        }
      });
      
      // Add new gallery image files
      selectedFiles.galleryImages.forEach((file, index) => {
        submitFormData.append(`galleryImages`, file);
      });
      
      // Add arrays as JSON strings
      submitFormData.append('inclusions', JSON.stringify(
        formData.inclusions.split(",").map((f) => f.trim()).filter((f) => f)
      ));
      submitFormData.append('exclusions', JSON.stringify(
        formData.exclusions.split(",").map((f) => f.trim()).filter((f) => f)
      ));
      submitFormData.append('highlights', JSON.stringify(
        formData.highlights.split(",").map((f) => f.trim()).filter((f) => f)
      ));
      submitFormData.append('itinerary', JSON.stringify(
        dayPlans
          .filter((day) => day.title.trim() && day.description.trim())
          .map((day, index) => ({
            day: String(index + 1),
            title: day.title.trim(),
            description: day.description.trim(),
          }))
      ));

      const url = editingId
        ? `/api/admin/packages/${editingId}`
        : "/api/admin/packages";
      const method = editingId ? "put" : "post";

      const response = await axios[method](url, submitFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast({
          title: editingId ? "Package Updated" : "Package Added",
          description: `Package has been successfully ${
            editingId ? "updated" : "added"
          }.`,
        });
        fetchPackages(currentPage);
        handleCancel();
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to save package",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save package",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeletingPackageId(id);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setDeletingButtonId(id);
    
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again to continue.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.delete(`/api/admin/packages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast({
          title: "Package Deleted",
          description: "Package has been successfully deleted.",
        });
        setDeletingPackageId(null);

        // Check if we need to go back to previous page
        const remainingPackages = Array.isArray(packages) ? packages.filter((p) => p._id !== id) : [];
        if (remainingPackages.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchPackages(currentPage);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete package",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingButtonId(null);
    }
  };

  const handleCancel = () => {
    const savedScrollPosition = scrollPositionRef.current;
    
    setIsAddModalOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      destination: "",
      shortDescription: "",
      fullDescription: "",
      duration: "",
      price: "",
      inclusions: "",
      exclusions: "",
      highlights: "",
      image: "",
      gallery: [],
      status: "active",
      featured: false,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    });
    setDayPlans([{ day: "1", title: "", description: "" }]);
    setSelectedFiles({
      mainImage: null,
      galleryImages: [],
    });
    
    requestAnimationFrame(() => {
      window.scrollTo({ 
        top: savedScrollPosition, 
        behavior: "instant" 
      });
    });
  };

  const addDayPlan = () => {
    const nextDay = (dayPlans.length + 1).toString();
    setDayPlans([...dayPlans, { day: nextDay, title: "", description: "" }]);
  };

  const removeDayPlan = (index: number) => {
    if (dayPlans.length > 1) {
      setDayPlans(dayPlans.filter((_, i) => i !== index));
    }
  };

  const updateDayPlan = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updatedDays = [...dayPlans];
    updatedDays[index][field] = value;
    setDayPlans(updatedDays);
  };

  const [selectedFiles, setSelectedFiles] = useState<{
    mainImage: File | null;
    galleryImages: File[];
  }>({
    mainImage: null,
    galleryImages: [],
  });

  const handleImageUpload = (type: "main" | "gallery") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = type === "gallery";
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        if (type === "main") {
          setSelectedFiles((prev) => ({ ...prev, mainImage: files[0] }));
          const previewUrl = URL.createObjectURL(files[0]);
          setFormData((prev) => ({ ...prev, image: previewUrl }));
        } else {
          setSelectedFiles((prev) => ({
            ...prev,
            galleryImages: [...prev.galleryImages, ...files],
          }));
          const previewUrls = files.map((file) => URL.createObjectURL(file));
          setFormData((prev) => ({
            ...prev,
            gallery: [...prev.gallery, ...previewUrls],
          }));
        }

        toast({
          title: "Images Selected",
          description: `${files.length} image(s) selected. Click Save to upload.`,
        });
      }
    };
    input.click();
  };

  const removeGalleryImage = (index: number) => {
    const removedUrl = formData.gallery[index];

    if (removedUrl && removedUrl.startsWith("blob:")) {
      const blobIndex = formData.gallery
        .filter((url) => url.startsWith("blob:"))
        .indexOf(removedUrl);
      if (blobIndex !== -1) {
        setSelectedFiles((prev) => ({
          ...prev,
          galleryImages: prev.galleryImages.filter((_, i) => i !== blobIndex),
        }));
      }
    }

    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPaginationItems = () => {
    if (!pagination) return [];
    
    const items = [];
    const { currentPage, totalPages } = pagination;

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => handlePageChange(currentPage - 1)}
          className={
            !pagination.hasPrevPage
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    // Page numbers
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className={`cursor-pointer ${
                currentPage === i
                  ? "bg-admin-gradient text-white border-0 hover:bg-admin-gradient"
                  : ""
              }`}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className={`cursor-pointer ${
              currentPage === 1
                ? "bg-admin-gradient text-white border-0 hover:bg-admin-gradient"
                : ""
            }`}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className={`cursor-pointer ${
                currentPage === i
                  ? "bg-admin-gradient text-white border-0 hover:bg-admin-gradient"
                  : ""
              }`}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className={`cursor-pointer ${
              currentPage === totalPages
                ? "bg-admin-gradient text-white border-0 hover:bg-admin-gradient"
                : ""
            }`}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => handlePageChange(currentPage + 1)}
          className={
            !pagination.hasNextPage
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    return items;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-admin-gradient bg-clip-text text-transparent">
            Packages Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your tour packages with detailed itineraries and pricing
          </p>
        </div>

        <Dialog
          open={isAddModalOpen}
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
            setIsAddModalOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                scrollPositionRef.current = window.scrollY;
                setEditingId(null);
                setFormData({
                  title: "",
                  destination: "",
                  shortDescription: "",
                  fullDescription: "",
                  duration: "",
                  price: "",
                  inclusions: "",
                  exclusions: "",
                  highlights: "",
                  image: "",
                  gallery: [],
                  status: "active",
                  featured: false,
                  seoTitle: "",
                  seoDescription: "",
                  seoKeywords: "",
                });
                setDayPlans([{ day: "1", title: "", description: "" }]);
                setSelectedFiles({
                  mainImage: null,
                  galleryImages: [],
                });
                setIsAddModalOpen(true);
              }}
              className="bg-admin-gradient text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Package
            </Button>
          </DialogTrigger>    
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="text-2xl bg-admin-gradient bg-clip-text text-transparent">
                {editingId ? "Edit Package" : "Add New Package"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-8 p-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold bg-admin-gradient bg-clip-text text-transparent">
                  Basic Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title" className="text-base font-semibold">
                      Package Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Ooty Hill Station Tour"
                      className={`mt-2 ${
                        isFormSubmitted && !formData.title
                          ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {isFormSubmitted && !formData.title && (
                      <p className="text-sm text-red-500 mt-1">
                        Package title is required
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="destination" className="text-base font-semibold">
                      Destination <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={(e) =>
                        setFormData({ ...formData, destination: e.target.value })
                      }
                      placeholder="e.g., Ooty, Tamil Nadu"
                      className={`mt-2 ${
                        isFormSubmitted && !formData.destination
                          ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {isFormSubmitted && !formData.destination && (
                      <p className="text-sm text-red-500 mt-1">
                        Destination is required
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="duration" className="text-base font-semibold">
                      Duration
                    </Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      placeholder="e.g., 3 Days 2 Nights"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-base font-semibold">
                      Price
                    </Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="e.g., ₹8,500 per person"
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div>
                  <Label htmlFor="shortDescription" className="text-base font-semibold">
                    Short Description
                  </Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortDescription: e.target.value,
                      })
                    }
                    placeholder="Brief description for package cards and listings"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="fullDescription" className="text-base font-semibold">
                    Full Description
                  </Label>
                  <div className="mt-2">
                    <RichTextEditor
                      value={formData.fullDescription}
                      onChange={(content: string) => setFormData({
                        ...formData,
                        fullDescription: content,
                      })}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Detailed description for package detail page. Use the toolbar to add bullet points and numbered lists."
                    />
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold bg-admin-gradient bg-clip-text text-transparent">
                  Package Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="inclusions" className="text-base font-semibold">
                      Inclusions (comma-separated)
                    </Label>
                    <Textarea
                      id="inclusions"
                      value={formData.inclusions}
                      onChange={(e) =>
                        setFormData({ ...formData, inclusions: e.target.value })
                      }
                      placeholder="e.g., Accommodation, Breakfast, Transportation, Sightseeing"
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exclusions" className="text-base font-semibold">
                      Exclusions (comma-separated)
                    </Label>
                    <Textarea
                      id="exclusions"
                      value={formData.exclusions}
                      onChange={(e) =>
                        setFormData({ ...formData, exclusions: e.target.value })
                      }
                      placeholder="e.g., Lunch & Dinner, Personal Expenses, Entry Fees"
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="highlights" className="text-base font-semibold">
                    Package Highlights (comma-separated)
                  </Label>
                  <Textarea
                    id="highlights"
                    value={formData.highlights}
                    onChange={(e) =>
                      setFormData({ ...formData, highlights: e.target.value })
                    }
                    placeholder="e.g., Botanical Gardens, Ooty Lake, Toy Train Ride, Tea Factory Visit"
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Day-wise Travel Plan */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold bg-admin-gradient bg-clip-text text-transparent">
                   Travel Places
                  </h3>
                  <Button
                    type="button"
                    onClick={addDayPlan}
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Day
                  </Button>
                </div>
                {dayPlans.map((day, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-900">Day {day.day}</h4>
                      {dayPlans.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeDayPlan(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                         Title
                        </Label>
                        <Input
                          value={day.title}
                          onChange={(e) =>
                            updateDayPlan(index, "title", e.target.value)
                          }
                          placeholder="e.g., Arrival & Local Sightseeing"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Description
                        </Label>
                        <Textarea
                          value={day.description}
                          onChange={(e) =>
                            updateDayPlan(index, "description", e.target.value)
                          }
                          placeholder="Detailed description of activities for this day"
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Images */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold bg-admin-gradient bg-clip-text text-transparent">
                  Images
                </h3>
                
                {/* Main Image */}
                <div>
                  <Label className="text-base font-semibold">
                    Main Image <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2 space-y-4">
                    <Button
                      type="button"
                      onClick={() => handleImageUpload("main")}
                      variant="outline"
                      className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-blue-400"
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click to upload main image
                        </p>
                      </div>
                    </Button>
                    {formData.image && (
                      <div className="relative">
                        <Image
                          src={formData.image}
                          alt="Main package image"
                          width={400}
                          height={192}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image: "" });
                            setSelectedFiles((prev) => ({ ...prev, mainImage: null }));
                          }}
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {isFormSubmitted && !formData.image && (
                    <p className="text-sm text-red-500 mt-1">
                      Main image is required
                    </p>
                  )}
                </div>

                {/* Gallery Images */}
                <div>
                  <Label className="text-base font-semibold">
                    Gallery Images (Optional)
                  </Label>
                  <div className="mt-2 space-y-4">
                    <Button
                      type="button"
                      onClick={() => handleImageUpload("gallery")}
                      variant="outline"
                      className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-blue-400"
                    >
                      <div className="text-center">
                        <ImageIcon className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Add gallery images
                        </p>
                      </div>
                    </Button>
                    {formData.gallery.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {formData.gallery.map((image, index) => (
                          <div key={index} className="relative">
                            <Image
                              src={image}
                              alt={`Gallery image ${index + 1}`}
                              width={120}
                              height={96}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
                    <Label htmlFor="status" className="text-base font-semibold">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 mt-8">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) =>
                        setFormData({ ...formData, featured: e.target.checked })
                      }
                      disabled={!formData.featured && maxFeaturedReached}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="featured" className="text-base font-semibold">
                      Featured Package
                    </Label>
                    {!formData.featured && maxFeaturedReached && (
                      <p className="text-xs text-gray-500">
                        (Max 3 featured packages)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold bg-admin-gradient bg-clip-text text-transparent">
                  SEO Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="seoTitle" className="text-base font-semibold">
                      SEO Title <span className="text-gray-500">(Optional)</span>
                    </Label>
                    <Input
                      id="seoTitle"
                      value={formData.seoTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, seoTitle: e.target.value })
                      }
                      placeholder="e.g., Ooty Hill Station Tour - 3 Days 2 Nights | Best Tours & Travels"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seoDescription" className="text-base font-semibold">
                      SEO Description <span className="text-gray-500">(Optional)</span>
                    </Label>
                    <Textarea
                      id="seoDescription"
                      value={formData.seoDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, seoDescription: e.target.value })
                      }
                      placeholder="e.g., Book your Ooty hill station tour with our premium travel packages. Experience scenic beauty, tea gardens, and comfortable accommodation."
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seoKeywords" className="text-base font-semibold">
                      SEO Keywords <span className="text-gray-500">(Optional)</span>
                    </Label>
                    <Input
                      id="seoKeywords"
                      value={formData.seoKeywords}
                      onChange={(e) =>
                        setFormData({ ...formData, seoKeywords: e.target.value })
                      }
                      placeholder="e.g., ooty tour packages, hill station tours, tamil nadu tourism, toy train ooty"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
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
                      {editingId ? "Update Package" : "Save Package"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Packages List - Horizontal Cards with Image Left */}
      <div className="grid gap-6">
        {Array.isArray(packages) && packages.map((pkg) => (
          <Card key={pkg._id} className="shadow-xl border-0">
            <CardContent className="p-10">
              <div className="flex gap-8">
                {/* Left Side - Package Image */}
                <div className="flex-shrink-0">
                  <div className="w-96 h-72 rounded-lg overflow-hidden border">
                    <Image
                      src={pkg.image || "/images/placeholder-package.jpg"}
                      alt={pkg.title}
                      width={384}
                      height={288}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Gallery Preview */}
                  {pkg.gallery && pkg.gallery.length > 0 && (
                    <div className="mt-3">
                      <div className="flex gap-2 overflow-x-auto">
                        {pkg.gallery.slice(0, 4).map((image, index) => (
                          <div key={index} className="flex-shrink-0">
                            <Image
                              src={image}
                              alt={`Gallery ${index + 1}`}
                              width={60}
                              height={40}
                              className="w-15 h-10 object-cover rounded border"
                            />
                          </div>
                        ))}
                        {pkg.gallery.length > 4 && (
                          <div className="flex-shrink-0 w-15 h-10 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600">
                            +{pkg.gallery.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Package Content */}
                <div className="flex-1 flex justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold text-gray-900">{pkg.title}</h3>
                      <Badge
                        variant={pkg.status === "active" ? "default" : "secondary"}
                        className={pkg.status === "active" ? "bg-admin-gradient text-white" : ""}
                      >
                        {pkg.status}
                      </Badge>
                      {pkg.featured && (
                        <Badge className="bg-yellow-500 text-yellow-900">
                          ⭐ Featured
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      {pkg.destination}
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="font-semibold text-gray-900">Duration: </span>
                        <span className="text-gray-600">{pkg.duration}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Price: </span>
                        <span className="text-gray-600">{pkg.price}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Inclusions: </span>
                        <span className="text-gray-600">{pkg.inclusions.length} items</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Itinerary: </span>
                        <span className="text-gray-600">{pkg.itinerary?.length || 0} days</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Description:</h4>
                      <p className="text-gray-600 text-sm line-clamp-3">{pkg.shortDescription}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Highlights:</h4>
                      <div className="flex flex-wrap gap-2">
                        {pkg.highlights.slice(0, 6).map((highlight, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                        {pkg.highlights.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{pkg.highlights.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-6">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(pkg)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteClick(pkg._id!)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>{renderPaginationItems()}</PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!Array.isArray(packages) || packages.length === 0) && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No packages found
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first tour package.
          </p>
          <Button
            onClick={() => {
              scrollPositionRef.current = window.scrollY;
              setEditingId(null);
              setFormData({
                title: "",
                destination: "",
                shortDescription: "",
                fullDescription: "",
                duration: "",
                price: "",
                inclusions: "",
                exclusions: "",
                highlights: "",
                image: "",
                gallery: [],
                status: "active",
                featured: false,
                seoTitle: "",
                seoDescription: "",
                seoKeywords: "",
              });
              setDayPlans([{ day: "1", title: "", description: "" }]);
              setSelectedFiles({
                mainImage: null,
                galleryImages: [],
              });
              setIsAddModalOpen(true);
            }}
            className="bg-admin-gradient text-white border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Package
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingPackageId}
        onOpenChange={() => setDeletingPackageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              package and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPackageId && handleDelete(deletingPackageId)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting && deletingButtonId === deletingPackageId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Package"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}