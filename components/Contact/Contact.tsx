"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Phone, Mail, MapPin, Send } from "lucide-react"
import { useBanner } from "@/hooks/use-banner"
import { useContact } from "@/hooks/use-contact"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}
interface ContactProps {
  services?: string[]
}

export const Contact = ({ services: propServices }: ContactProps) => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  })

  // Use dynamic contact info from API
  const { contactInfo } = useContact()

  // Get dynamic services from contact info or use prop services or fallback
  const services = contactInfo?.servicesOffered 
    ? contactInfo.servicesOffered.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : propServices || [
        "One-way Trip",
        "Round Trip", 
        "Airport Taxi",
        "Day Rental",
        "Hourly Package",
        "Local Pickup/Drop",
        "Tour Package"
      ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.phone || !formData.service) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare data for API
      const submissionData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        serviceType: formData.service.trim(),
        travelDate: new Date().toISOString().split('T')[0],
        pickupLocation: "To be specified", // Required field
        dropLocation: "To be specified",
        passengers: 1,
        message: formData.message.trim(),
        status: "new", // Required field
        priority: "medium", // Required field
        source: "website", // Changed from "contact_form" to "website"
        estimatedCost: "To be determined",
        notes: `Contact form submission\nEmail: ${formData.email}\nMessage: ${formData.message}`
      };

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const result = await response.json();

      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      })

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "There was an error sending your message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Contact details using dynamic data with fallbacks
  const contactDetails = [
    {
      icon: <Phone className="h-5 w-5 text-white" />,
      title: "Phone",
      details: (
        <div className="space-y-1">
          <p className="text-gray-900 font-medium text-sm sm:text-base break-words">
            {contactInfo?.primaryPhone}
          </p>
          {contactInfo?.secondaryPhone && (
            <p className="text-gray-900 font-medium text-sm sm:text-base break-words">
              {contactInfo.secondaryPhone}
            </p>
          )}
        </div>
      ),
      description: contactInfo?.businessHours || "24/7 Available",
    },
    {
      icon: <Mail className="h-5 w-5 text-white" />,
      title: "Email Address",
      details: contactInfo?.email || "info@mnt.com",
      description: "We'll respond within 24 hours",
    },
    {
      icon: <MapPin className="h-5 w-5 text-white" />,
      title: "Address",
      details: contactInfo?.address || "88/153, East Street, Pandiyan Nagar",
      description: `${contactInfo?.city || "South Madurai"}, ${
        contactInfo?.state || "Tamil Nadu"
      }-${contactInfo?.pincode || "625006"}`,
    },
  ]

  const { banner } = useBanner("contact")

  return (
    <>
      {/* Hero Section */}
  <section className="relative bg-admin-gradient text-white py-16 sm:py-20 lg:py-24 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            {/* Image Layer */}
            <div className="absolute inset-0 opacity-100 transition-opacity duration-700">
              <img
                src={banner?.status === "active" && banner?.image ? banner.image : "/placeholder.jpg"}
                alt={banner?.title || "Tamil Nadu Tourism"}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Dark Overlay Layer */}
            <div className="absolute inset-0 bg-black/50" />
            
            {/* Gradient Overlay Layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-transparent" />
            
            {/* Admin Gradient Layer */}
            <div className="absolute inset-0 bg-admin-gradient/20" />
            
            {/* Animated Gradient Layers */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-yellow-600/20 via-transparent to-orange-600/20"
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute inset-0 bg-gradient-to-bl from-orange-500/20 via-transparent to-yellow-500/20"
              animate={{
                opacity: [0.7, 0.3, 0.7],
              }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-3 sm:mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Get In Touch
            </Badge>

            {banner?.title && (
              <p className="text-white/90 text-base sm:text-lg md:text-xl mb-2 sm:mb-3">{banner.title}</p>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              {contactInfo?.pageTitle || "Plan Your Perfect Journey"}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
              {contactInfo?.pageDescription ||
                "Ready to explore beautiful destinations? Contact our travel experts today and let us plan your perfect journey with comfort and safety."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section id="contact-form" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 max-w-7xl mx-auto">
            {/* Contact Form */}
            <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
              <Card className="shadow-xl border-0">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Send Us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="fullName" className="text-gray-700 font-medium text-sm sm:text-base">
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          placeholder="Enter your full name"
                          className="mt-1.5 sm:mt-2 h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-700 font-medium text-sm sm:text-base">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Enter your email"
                          className="mt-1.5 sm:mt-2 h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-gray-700 font-medium text-sm sm:text-base">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={formData.phone}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, "")
                            handleInputChange("phone", numericValue)
                          }}
                          placeholder="Enter your phone number"
                          className="mt-1.5 sm:mt-2 h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="service" className="text-gray-700 font-medium text-sm sm:text-base">
                          Service of Interest
                        </Label>
                        <Select value={formData.service} onValueChange={(value) => handleInputChange("service", value)}>
                          <SelectTrigger className="mt-1.5 sm:mt-2 h-10 sm:h-12 text-sm sm:text-base">
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service} value={service} className="text-sm sm:text-base">
                                {service}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-gray-700 font-medium text-sm sm:text-base">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        required
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Tell us about your travel requirements..."
                        rows={4}
                        className="mt-1.5 sm:mt-2 text-sm sm:text-base resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-10 sm:h-12 bg-admin-gradient text-white text-sm sm:text-base lg:text-lg font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                          <span className="text-xs sm:text-sm lg:text-base">Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs sm:text-sm lg:text-base">Send Message</span>
                          <Send className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6 lg:space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
                  Contact Information
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
                  Get in touch with our team of travel experts. We're here to help you with all your travel needs and
                  provide exceptional travel experiences across Tamil Nadu.
                </p>
              </motion.div>

              {contactDetails.map((info, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-admin-gradient rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          <div className="text-white">{info.icon}</div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base lg:text-lg">
                            {info.title}
                          </h3>
                          {typeof info.details === 'string' ? (
                            <p className="text-gray-900 font-medium mb-1 text-sm sm:text-base break-words">
                              {info.details}
                            </p>
                          ) : (
                            info.details
                          )}
                          <p className="text-xs sm:text-sm text-gray-600">{info.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google Maps Section */}
      <section className="mb-5 bg-white">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <motion.div
            className="text-center mb-8 sm:mb-12 lg:mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Badge className="mb-4 sm:mb-6 bg-admin-gradient text-white px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Visit Our Office
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 leading-tight px-2">
              {contactInfo?.officeTitle || "Visit Our Office in Madurai, Tamil Nadu"}
            </h2>
            <p className="text-sm sm:text-base  text-gray-600 max-w-3xl mx-auto px-4 leading-relaxed">
              {contactInfo?.officeDescription ||
                "Located in the heart of Madurai, our office is easily accessible and welcoming to all our clients"}
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl">
              {contactInfo?.mapEmbedCode ? (
                <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] relative">
                  <div
                    className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                    dangerouslySetInnerHTML={{ __html: contactInfo.mapEmbedCode }}
                  />
                </div>
              ) : (
                <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Map will be displayed here</p>
                    <p className="text-gray-400 text-sm">Configure map embed code in admin panel</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
