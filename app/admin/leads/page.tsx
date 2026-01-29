"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/hooks/use-leads";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Car,
  Package,
  Settings,
  User
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import ViewLeads from "./components/ViewLeads";

interface TravelLead {
  _id?: string;
  id: number;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  travelDate: string;
  travelTime?: string;
  returnDate?: string;
  pickupLocation: string;
  dropLocation: string;
  passengers: number;
  message: string;
  status: "new" | "contacted" | "confirmed" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  source: "website" | "whatsapp" | "phone" | "referral";
  submittedAt: string;
  lastUpdated: string;
  estimatedCost?: string;
  notes?: string;
  reviewLink?: string;
  reviewToken?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function LeadManager() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<TravelLead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<TravelLead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const scrollPositionRef = useRef<number>(0);

  // Dynamic service types from contact API
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const { leads: leadsData, isLoading: leadsLoading, mutate } = useLeads();
  const [leads, setLeads] = useState<TravelLead[]>([]);

  // Fetch service types from contact API
  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    try {
      setServicesLoading(true);
      const response = await fetch('/api/admin/contact');
      const result = await response.json();
      
      if (result.success && result.data?.servicesOffered) {
        const services = result.data.servicesOffered
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        setServiceTypes(services);
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

  // Transform leads data when it changes
  useEffect(() => {
    if (leadsData && leadsData.length > 0) {
      const transformedLeads = leadsData.map((lead: any, index: number) => ({
        id: index + 1,
        _id: lead._id,
        fullName: lead.fullName,
        email: lead.email || "",
        phone: lead.phone,
        serviceType: lead.serviceType,
        travelDate: lead.travelDate,
        travelTime: lead.travelTime || "",
        returnDate: lead.returnDate || "",
        pickupLocation: lead.pickupLocation,
        dropLocation: lead.dropLocation || "",
        passengers: lead.passengers || 1,
        message: lead.message,
        status: lead.status,
        priority: lead.priority,
        source: lead.source,
        submittedAt: lead.submittedAt,
        lastUpdated: lead.lastUpdated,
        estimatedCost: lead.estimatedCost || "",
        notes: lead.notes || "",
        reviewLink: lead.reviewLink || "",
        reviewToken: lead.reviewToken || ""
      }));
      setLeads(transformedLeads);
    }
  }, [leadsData]);

  // Set loading state from hook
  useEffect(() => {
    setIsLoading(leadsLoading);
  }, [leadsLoading]);

  const [newLead, setNewLead] = useState<{
    fullName: string;
    email: string;
    phone: string;
    serviceType: string;
    travelDate: string;
    travelTime: string;
    returnDate: string;
    pickupLocation: string;
    dropLocation: string;
    passengers: number;
    message: string;
    status: "new" | "contacted" | "confirmed" | "completed" | "cancelled";
    priority: "low" | "medium" | "high";
    source: "website" | "whatsapp" | "phone" | "referral";
    estimatedCost: string;
    notes: string;
  }>({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "",
    travelDate: "",
    travelTime: "",
    returnDate: "",
    pickupLocation: "",
    dropLocation: "",
    passengers: 1,
    message: "",
    status: "new",
    priority: "medium",
    source: "website",
    estimatedCost: "",
    notes: "",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "contacted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "website":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "whatsapp":
        return "bg-green-100 text-green-800 border-green-200";
      case "phone":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "referral":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-4 w-4" />;
      case "contacted":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.dropLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || lead.priority === priorityFilter;
    const matchesService =
      serviceFilter === "all" || lead.serviceType === serviceFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesService;
  });

  const handleEditLead = (lead: TravelLead) => {
    scrollPositionRef.current = window.scrollY;
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleViewLead = (lead: TravelLead) => {
    scrollPositionRef.current = window.scrollY;
    // Find the most up-to-date lead data from the leads array
    const currentLead = leads.find(l => l._id === lead._id) || lead;
    setSelectedLead(currentLead);
    setIsViewModalOpen(true);
  };

  const handleDeleteLead = (lead: TravelLead) => {
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/leads?id=${leadToDelete._id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Refresh leads data
        mutate();

        toast({
          title: "Lead Deleted",
          description: `${leadToDelete.fullName}'s lead has been successfully deleted.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete lead",
          variant: "destructive",
        });
      }

      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({
        title: "Error",
        description: "Failed to delete lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLead = async (updatedLead: TravelLead) => {
    try {
      setIsSaving(true);

      const response = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: updatedLead._id,
          fullName: updatedLead.fullName,
          email: updatedLead.email,
          phone: updatedLead.phone,
          serviceType: updatedLead.serviceType,
          travelDate: updatedLead.travelDate,
          pickupLocation: updatedLead.pickupLocation,
          dropLocation: updatedLead.dropLocation,
          passengers: updatedLead.passengers,
          message: updatedLead.message,
          status: updatedLead.status,
          priority: updatedLead.priority,
          source: updatedLead.source,
          estimatedCost: updatedLead.estimatedCost,
          notes: updatedLead.notes,
        }),
      });

      const result = await response.json();
      console.log('Update lead result:', result);

      if (result.success) {
        // Refresh leads data
        mutate();

        setIsEditModalOpen(false);
        
        // Update the selected lead with the new data (including review link if generated)
        if (result.data) {
          const updatedLeadData = {
            ...updatedLead,
            reviewLink: result.data.reviewLink,
            reviewToken: result.data.reviewToken,
            lastUpdated: result.data.lastUpdated
          };
          console.log('Updated lead data:', updatedLeadData);
          setSelectedLead(updatedLeadData);
        }

        // Show special message if review link was generated
        if (result.reviewLink) {
          toast({
            title: "Lead Updated & Review Link Generated",
            description: `${updatedLead.fullName}'s status updated to completed. Review link is ready to share via WhatsApp.`,
          });
        } else {
          toast({
            title: "Lead Updated",
            description: `${updatedLead.fullName}'s information has been updated successfully.`,
          });
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: "Error",
        description: "Failed to update lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLead = async () => {
    setIsFormSubmitted(true);

    if (
      !newLead.fullName ||
      !newLead.email ||
      !newLead.phone ||
      !newLead.serviceType ||
      !newLead.travelDate ||
      !newLead.pickupLocation ||
      !newLead.message
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newLead.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLead),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh leads data
        mutate();

        setNewLead({
          fullName: "",
          email: "",
          phone: "",
          serviceType: "",
          travelDate: "",
          travelTime: "",
          returnDate: "",
          pickupLocation: "",
          dropLocation: "",
          passengers: 1,
          message: "",
          status: "new",
          priority: "medium",
          source: "website",
          estimatedCost: "",
          notes: "",
        });
        setIsAddModalOpen(false);
        setIsFormSubmitted(false);

        toast({
          title: "Lead Added Successfully",
          description: `${newLead.fullName} has been added to your leads.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding lead:", error);
      toast({
        title: "Error",
        description: "Failed to add lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportLeads = () => {
    // Create CSV content
    const headers = [
      "Name", "Email", "Phone", "Service", "Travel Date", 
      "Pickup", "Drop", "Passengers", "Status", "Priority", 
      "Source", "Estimated Cost", "Submitted At"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map(lead => [
        lead.fullName,
        lead.email,
        lead.phone,
        lead.serviceType,
        lead.travelDate,
        lead.pickupLocation,
        lead.dropLocation,
        lead.passengers,
        lead.status,
        lead.priority,
        lead.source,
        lead.estimatedCost || "",
        new Date(lead.submittedAt).toLocaleDateString()
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mnt-leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `${filteredLeads.length} leads exported to CSV file.`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = [
    {
      title: "Total Leads",
      value: leads.length.toString(),
      icon: <Users className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "New Leads",
      value: leads.filter((l) => l.status === "new").length.toString(),
      icon: <AlertCircle className="h-6 w-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Confirmed",
      value: leads.filter((l) => l.status === "confirmed").length.toString(),
      icon: <CheckCircle className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "High Priority",
      value: leads.filter((l) => l.priority === "high").length.toString(),
      icon: <Star className="h-6 w-6" />,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-full mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-4xl font-bold bg-admin-gradient bg-clip-text text-transparent">
              Lead Manager
            </h1>
            <p className="text-gray-600 mt-2">
              View all enquiries submitted via the website with WhatsApp integration and export options
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleExportLeads}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            
            <Dialog
              open={isAddModalOpen}
              onOpenChange={(open) => {
                setIsAddModalOpen(open);
                if (!open) {
                  setIsFormSubmitted(false);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-admin-gradient text-white shadow-lg hover:shadow-2xl transition-all duration-300">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Lead
                </Button>
              </DialogTrigger>       
       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl bg-admin-gradient bg-clip-text text-transparent font-bold flex items-center gap-2">
                    <UserPlus className="h-6 w-6" />
                    Add New Travel Lead
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Customer Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={newLead.fullName}
                      onChange={(e) =>
                        setNewLead({ ...newLead, fullName: e.target.value })
                      }
                      placeholder="Enter customer name"
                      className={
                        isFormSubmitted && !newLead.fullName
                          ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                          : ""
                      }
                    />
                    {isFormSubmitted && !newLead.fullName && (
                      <p className="text-xs text-red-500 mt-1">
                        Name is required
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newLead.email}
                      onChange={(e) =>
                        setNewLead({ ...newLead, email: e.target.value })
                      }
                      placeholder="Enter email address"
                      className={
                        isFormSubmitted && !newLead.email
                          ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                          : ""
                      }
                    />
                    {isFormSubmitted && !newLead.email && (
                      <p className="text-xs text-red-500 mt-1">
                        Email is required
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newLead.phone}
                      onChange={(e) =>
                        setNewLead({ ...newLead, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                      className={
                        isFormSubmitted && !newLead.phone
                          ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                          : ""
                      }
                    />
                    {isFormSubmitted && !newLead.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        Phone is required
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceType" className="text-sm font-medium">
                      Service Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newLead.serviceType}
                      onValueChange={(value) =>
                        setNewLead({ ...newLead, serviceType: value })
                      }
                    >
                      <SelectTrigger
                        className={
                          isFormSubmitted && !newLead.serviceType
                            ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicesLoading ? (
                          <SelectItem value="loading" disabled>Loading services...</SelectItem>
                        ) : (
                          serviceTypes.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {isFormSubmitted && !newLead.serviceType && (
                      <p className="text-xs text-red-500 mt-1">
                        Service type is required
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="travelDate" className="text-sm font-medium">
                      Travel Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="travelDate"
                      type="date"
                      value={newLead.travelDate}
                      onChange={(e) =>
                        setNewLead({ ...newLead, travelDate: e.target.value })
                      }
                      className={
                        isFormSubmitted && !newLead.travelDate
                          ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                          : ""
                      }
                    />
                    {isFormSubmitted && !newLead.travelDate && (
                      <p className="text-xs text-red-500 mt-1">
                        Travel date is required
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passengers" className="text-sm font-medium">
                      Number of Passengers
                    </Label>
                    <Input
                      id="passengers"
                      type="number"
                      min="1"
                      max="20"
                      value={newLead.passengers}
                      onChange={(e) =>
                        setNewLead({ ...newLead, passengers: Number(e.target.value) })
                      }
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupLocation" className="text-sm font-medium">
                      Pickup Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="pickupLocation"
                      value={newLead.pickupLocation}
                      onChange={(e) =>
                        setNewLead({ ...newLead, pickupLocation: e.target.value })
                      }
                      placeholder="Enter pickup location"
                      className={
                        isFormSubmitted && !newLead.pickupLocation
                          ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                          : ""
                      }
                    />
                    {isFormSubmitted && !newLead.pickupLocation && (
                      <p className="text-xs text-red-500 mt-1">
                        Pickup location is required
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dropLocation" className="text-sm font-medium">
                      Drop Location
                    </Label>
                    <Input
                      id="dropLocation"
                      value={newLead.dropLocation}
                      onChange={(e) =>
                        setNewLead({ ...newLead, dropLocation: e.target.value })
                      }
                      placeholder="Enter drop location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium">
                      Priority
                    </Label>
                    <Select
                      value={newLead.priority}
                      onValueChange={(value) =>
                        setNewLead({
                          ...newLead,
                          priority: value as "low" | "medium" | "high",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source" className="text-sm font-medium">
                      Lead Source
                    </Label>
                    <Select
                      value={newLead.source}
                      onValueChange={(value) =>
                        setNewLead({
                          ...newLead,
                          source: value as "website" | "whatsapp" | "phone" | "referral",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedCost" className="text-sm font-medium">
                      Estimated Cost
                    </Label>
                    <Input
                      id="estimatedCost"
                      value={newLead.estimatedCost}
                      onChange={(e) =>
                        setNewLead({ ...newLead, estimatedCost: e.target.value })
                      }
                      placeholder="₹5,000"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Customer Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      value={newLead.message}
                      onChange={(e) =>
                        setNewLead({ ...newLead, message: e.target.value })
                      }
                      placeholder="Enter customer requirements and message"
                      rows={3}
                      className={
                        isFormSubmitted && !newLead.message
                          ? "ring-1 ring-red-500 focus:ring-2 focus:ring-red-500"
                          : ""
                      }
                    />
                    {isFormSubmitted && !newLead.message && (
                      <p className="text-xs text-red-500 mt-1">
                        Message is required
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Internal Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={newLead.notes}
                      onChange={(e) =>
                        setNewLead({ ...newLead, notes: e.target.value })
                      }
                      placeholder="Internal notes for follow-up"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddLead}
                    disabled={isSaving}
                    className="bg-admin-gradient text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Lead
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="initial"
          animate="animate"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <div className={stat.color}>{stat.icon}</div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">
                        {stat.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search leads by name, email, phone, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Service Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {servicesLoading ? (
                        <SelectItem value="loading" disabled>Loading services...</SelectItem>
                      ) : (
                        serviceTypes.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leads Table */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 bg-admin-gradient bg-clip-text text-transparent">
                <Users className="h-5 w-5 text-admin-primary" />
                Travel Leads ({filteredLeads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Travel Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {lead.fullName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {lead.email}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {lead.serviceType.includes("Tour") ? (
                              <Package className="h-4 w-4 text-purple-600" />
                            ) : (
                              <Car className="h-4 w-4 text-blue-600" />
                            )}
                            <span className="font-medium">{lead.serviceType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              {new Date(lead.travelDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              <MapPin className="h-3 w-3 text-green-600" />
                              {lead.pickupLocation}
                            </div>
                            {lead.dropLocation && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-red-600" />
                                {lead.dropLocation}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              {lead.passengers} passenger{lead.passengers > 1 ? 's' : ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lead.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(lead.status)}
                              {lead.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(lead.priority)}>
                            {lead.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSourceColor(lead.source)}>
                            {lead.source === "whatsapp" && <WhatsAppIcon className="h-3 w-3 mr-1" />}
                            {lead.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {lead.estimatedCost || "TBD"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {formatDate(lead.submittedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewLead(lead)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditLead(lead)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* Share Review Link Button for Completed Leads */}
                            {lead.status === "completed" && lead.reviewLink && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const reviewMessage = `Hi ${lead.fullName}! Thank you for choosing mnt Tours & Travels. We hope you had a great experience with our ${lead.serviceType} service. 

Please take a moment to share your feedback by clicking here: ${lead.reviewLink}

If the link doesn't work, you can copy and paste this URL in your browser: ${lead.reviewLink}

Your feedback helps us serve you better! 🙏`;
                                  window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(reviewMessage)}`);
                                }}
                                className="h-8 w-8 p-0 text-yellow-600 hover:bg-yellow-50"
                                title="Share Review Link via WhatsApp"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteLead(lead)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
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
              {filteredLeads.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No leads found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || serviceFilter !== "all"
                      ? "Try adjusting your search criteria."
                      : "Add your first travel lead to get started."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Lead Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-admin-gradient bg-clip-text text-transparent font-bold flex items-center gap-2">
                <Edit className="h-6 w-6" />
                Update Lead Status & Details
              </DialogTitle>
              <p className="text-gray-600 text-sm mt-2">
                Customer information is read-only. You can only update administrative fields.
              </p>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-6 py-4">
                {/* Read-only Customer Information */}
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information (Read-only)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                      <p className="text-lg font-semibold text-gray-900">{selectedLead.fullName}</p>
                    </div>
                    {selectedLead.email && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <p className="text-gray-900">{selectedLead.email}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-gray-900">{selectedLead.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Service Type</Label>
                      <p className="text-gray-900">{selectedLead.serviceType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Travel Date</Label>
                      <p className="text-gray-900">{new Date(selectedLead.travelDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Passengers</Label>
                      <p className="text-gray-900">{selectedLead.passengers}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Pickup Location</Label>
                      <p className="text-gray-900">{selectedLead.pickupLocation}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Drop Location</Label>
                      <p className="text-gray-900">{selectedLead.dropLocation || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-600">Customer Message</Label>
                    <p className="mt-1 p-3 bg-white rounded border text-gray-900">{selectedLead.message}</p>
                  </div>
                </div>

                {/* Editable Administrative Fields */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Administrative Details (Editable)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="editStatus" className="text-sm font-medium">
                        Lead Status
                      </Label>
                      <Select
                        value={selectedLead.status}
                        onValueChange={(value) =>
                          setSelectedLead({
                            ...selectedLead,
                            status: value as "new" | "contacted" | "confirmed" | "completed" | "cancelled",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPriority" className="text-sm font-medium">
                        Priority Level
                      </Label>
                      <Select
                        value={selectedLead.priority}
                        onValueChange={(value) =>
                          setSelectedLead({
                            ...selectedLead,
                            priority: value as "low" | "medium" | "high",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editEstimatedCost" className="text-sm font-medium">
                        Estimated Cost
                      </Label>
                      <Input
                        id="editEstimatedCost"
                        value={selectedLead.estimatedCost || ""}
                        onChange={(e) =>
                          setSelectedLead({ ...selectedLead, estimatedCost: e.target.value })
                        }
                        placeholder="₹5,000 or To be determined"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editSource" className="text-sm font-medium">
                        Lead Source
                      </Label>
                      <Select
                        value={selectedLead.source}
                        onValueChange={(value) =>
                          setSelectedLead({
                            ...selectedLead,
                            source: value as "website" | "whatsapp" | "phone" | "referral",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <Label htmlFor="editNotes" className="text-sm font-medium">
                      Internal Notes & Follow-up Details
                    </Label>
                    <Textarea
                      id="editNotes"
                      value={selectedLead.notes || ""}
                      onChange={(e) =>
                        setSelectedLead({ ...selectedLead, notes: e.target.value })
                      }
                      placeholder="Add internal notes, follow-up details, pricing discussions, etc."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedLead && handleUpdateLead(selectedLead)}
                disabled={isSaving}
                className="bg-admin-gradient text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Lead
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Lead Modal */}
        <ViewLeads
          key={selectedLead?._id || 'no-lead'}
          lead={selectedLead}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Lead</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this lead? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteLead}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Lead"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}