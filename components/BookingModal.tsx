"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Navigation } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { useToast } from "@/hooks/use-toast";
import { useContact } from "@/hooks/use-contact";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledService?: string;
  prefilledTitle?: string;
}

export default function BookingModal({ isOpen, onClose, prefilledService, prefilledTitle }: BookingModalProps) {
  const { toast } = useToast();
  const { contactInfo } = useContact();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: prefilledService || "",
    pickupLocation: "",
    dropLocation: "",
    travelDate: "",
    travelTime: "",
    returnDate: ""
  });

  // Get dynamic services from contact info or use fallback
  const services = contactInfo?.servicesOffered 
    ? contactInfo.servicesOffered.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [
        "One-way Trip",
        "Round Trip", 
        "Airport Taxi",
        "Day Rental",
        "Hourly Package",
        "Local Pickup/Drop",
        "Tour Package"
      ];

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        const result = await response.json();
        
        if (result.success) {
          setLocations(result.data.map((loc: any) => loc.name));
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        // Fallback locations if API fails
        setLocations([
          "Madurai", "Chennai", "Mumbai", "Delhi", "Bangalore",
          "Coimbatore", "Trichy", "Salem", "Erode", "Tirunelveli"
        ]);
      }
    };

    fetchLocations();
  }, []);



  // Reset form when modal opens with prefilled data
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        service: prefilledService || prev.service || "",
      }));
    }
  }, [isOpen, prefilledService]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const requiredFields = [
      { field: 'name', label: 'Full Name' },
      { field: 'phone', label: 'Phone Number' },
      { field: 'service', label: 'Service Type' },
      { field: 'pickupLocation', label: 'Pickup Location' },
      { field: 'dropLocation', label: 'Drop Location' },
      { field: 'travelDate', label: 'Travel Date' }
    ];

    const missingFields = requiredFields.filter(({ field }) => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast({
        title: "Please fill required fields",
        description: `Missing: ${missingFields.map(f => f.label).join(', ')}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate return date for round trips
    if (formData.service === "Round Trip" && !formData.returnDate) {
      toast({
        title: "Return date required",
        description: "Please select a return date for round trip service",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Save lead to database
      const leadData = {
        fullName: formData.name,
        email: "", // No email provided in modal booking
        phone: formData.phone,
        serviceType: formData.service,
        travelDate: formData.travelDate,
        travelTime: formData.travelTime || "",
        returnDate: formData.returnDate || "",
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        passengers: 1, // Default value
        message: `Modal booking request for ${formData.service}. Pickup: ${formData.pickupLocation}, Drop: ${formData.dropLocation}, Date: ${formData.travelDate}${formData.travelTime ? `, Time: ${formData.travelTime}` : ''}${formData.returnDate ? `, Return: ${formData.returnDate}` : ''}`,
        status: "new",
        priority: "high",
        source: "website",
        estimatedCost: "To be determined",
        notes: "Modal booking form submission"
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      const result = await response.json();

      if (!result.success) {
        toast({
          title: "Booking failed",
          description: result.error || "Failed to submit booking. Please try again or call us directly.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create WhatsApp message
      const message = `🚗 *Booking Request*

*Name:* ${formData.name}
*Phone:* ${formData.phone}
*Service:* ${formData.service}
*Pickup:* ${formData.pickupLocation}
*Drop:* ${formData.dropLocation}
*Pickup Date:* ${formData.travelDate}
*Pickup Time:* ${formData.travelTime}${formData.returnDate ? `\n*Return Date:* ${formData.returnDate}` : ''}

Please confirm availability and provide final pricing.`;

      // Open WhatsApp
      const whatsappNumber = contactInfo?.whatsappNumber || contactInfo?.primaryPhone || '919876543210';
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: "Booking Request Sent!",
        description: "We'll contact you shortly with availability and pricing details.",
      });

      // Reset form and close modal
      setFormData({
        name: "",
        phone: "",
        service: "",
        pickupLocation: "",
        dropLocation: "",
        travelDate: "",
        travelTime: "",
        returnDate: ""
      });
      onClose();
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Booking submission failed",
        description: "Unable to submit your booking request. Please try again or contact us directly for assistance.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
            <WhatsAppIcon className="h-6 w-6 mr-2 text-admin-primary" />
            Book Your Travel
            {prefilledTitle && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                - {prefilledTitle}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>
          </div>



          {/* Service Selection */}
          <div>
            <Label htmlFor="service" className="text-gray-700 font-medium">
              Service Type *
            </Label>
            <Select
              value={formData.service}
              onValueChange={(value) => handleInputChange("service", value)}
              required
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickupLocation" className="text-gray-700 font-medium flex items-center">
                <Navigation className="h-4 w-4 mr-1 text-green-500" />
                Pickup Location *
              </Label>
              <Input
                id="pickupLocation"
                type="text"
                required
                value={formData.pickupLocation}
                onChange={(e) => handleInputChange("pickupLocation", e.target.value)}
                placeholder="Enter pickup location"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dropLocation" className="text-gray-700 font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-red-500" />
                Drop Location *
              </Label>
              <Input
                id="dropLocation"
                type="text"
                required
                value={formData.dropLocation}
                onChange={(e) => handleInputChange("dropLocation", e.target.value)}
                placeholder="Enter drop location"
                className="mt-1"
              />
            </div>
          </div>

          {/* Travel Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="travelDate" className="text-gray-700 font-medium">
                Pickup Date *
              </Label>
              <Input
                id="travelDate"
                type="date"
                required
                value={formData.travelDate}
                onChange={(e) => handleInputChange("travelDate", e.target.value)}
                className="mt-1"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="travelTime" className="text-gray-700 font-medium">
                Pickup Time
              </Label>
              <Input
                id="travelTime"
                type="time"
                value={formData.travelTime}
                onChange={(e) => handleInputChange("travelTime", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Return Date (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="returnDate" className="text-gray-700 font-medium">
                Return Date {formData.service === "Round Trip" ? "*" : "(Optional)"}
              </Label>
              <Input
                id="returnDate"
                type="date"
                required={formData.service === "Round Trip"}
                value={formData.returnDate}
                onChange={(e) => handleInputChange("returnDate", e.target.value)}
                className="mt-1"
                min={formData.travelDate || new Date().toISOString().split('T')[0]}
                placeholder="Select return date if needed"
              />
            </div>
            <div></div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-admin-gradient text-white hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <WhatsAppIcon className="h-4 w-4 mr-2" />
                  Submit Now
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}