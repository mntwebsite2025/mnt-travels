"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Car, 
  Clock, 
  Users, 
  CheckCircle, 
  Phone,
  Star,
  MapPin,
  Shield
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { useState } from "react";
import { useContact } from "@/hooks/use-contact";
import BookingModal from "@/components/BookingModal";

interface TariffData {
  id: string;
  vehicleType: string;
  vehicleName: string;
  description: string;
  oneWayRate: string;
  roundTripRate: string;
  driverAllowance: string;
  minimumKmOneWay: string;
  minimumKmRoundTrip: string;
  image: string;
  featured: boolean;
  additionalCharges: string[];
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

interface TariffDetailClientProps {
  tariffData: TariffData;
}

export default function TariffDetailClient({ tariffData }: TariffDetailClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { contactInfo } = useContact();

  const handleBookNow = () => {
    const message = `🚗 *Vehicle Booking Request*

*Vehicle:* ${tariffData.vehicleName}
*Type:* ${tariffData.vehicleType}
*One-way Rate:* ₹${tariffData.oneWayRate}/km
*Round Trip Rate:* ₹${tariffData.roundTripRate}/km

I'm interested in booking this vehicle. Please provide:
- Available dates
- Final pricing for my route
- Booking confirmation

Thank you!`;

    const whatsappNumber = contactInfo?.whatsappNumber || contactInfo?.primaryPhone || '919003782966';
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCallNow = () => {
    const phoneNumber = contactInfo?.primaryPhone || '+919003782966';
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleModalBooking = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-admin-gradient text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link
              href="/tariff"
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tariff
            </Link>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-white/20 text-white border-white/30 px-4 py-2">
                  <Car className="h-4 w-4 mr-2" />
                  {tariffData.vehicleType}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {tariffData.vehicleName}
                </h1>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  {tariffData.description}
                </p>
                
                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="font-semibold">₹{tariffData.oneWayRate.replace(/[₹$]/g, '').replace(/per\s*km/gi, '').replace(/\/km/gi, '').trim()}/km One-way</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-semibold">₹{tariffData.roundTripRate.replace(/[₹$]/g, '').replace(/per\s*km/gi, '').replace(/\/km/gi, '').trim()}/km Round Trip</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    <span className="font-semibold">Professional Service</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleBookNow}
                    size="lg"
                    className="bg-white text-admin-primary hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                  >
                    <WhatsAppIcon className="h-5 w-5 mr-2" />
                    Book via WhatsApp
                  </Button>
                  <Button
                    onClick={handleCallNow}
                    size="lg"
                    variant="outline"
                    className="border-white/50 text-white hover:bg-white hover:text-admin-primary hover:border-white px-8 py-3 text-lg font-semibold transition-all duration-300 bg-white/10 backdrop-blur-sm"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Now
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={tariffData.image || "/toyota-innova-crysta-luxury-taxi.png"}
                    alt={tariffData.vehicleName}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  {tariffData.featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-500 text-yellow-900">
                        ⭐ Featured Vehicle
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Details */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Pricing Information */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg border-0">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Car className="h-6 w-6 mr-3 text-admin-primary" />
                      Pricing Details
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">One-way Trip</h3>
                        <div className="text-3xl font-bold text-blue-600 mb-2">₹{tariffData.oneWayRate.replace(/[₹$]/g, '').replace(/per\s*km/gi, '').replace(/\/km/gi, '').trim()}/km</div>
                        <p className="text-blue-700 text-sm">Minimum {tariffData.minimumKmOneWay.replace(/km/gi, '').trim()} km</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">Round Trip</h3>
                        <div className="text-3xl font-bold text-green-600 mb-2">₹{tariffData.roundTripRate.replace(/[₹$]/g, '').replace(/per\s*km/gi, '').replace(/\/km/gi, '').trim()}/km</div>
                        <p className="text-green-700 text-sm">Minimum {tariffData.minimumKmRoundTrip.replace(/km/gi, '').trim()} km</p>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-semibold text-yellow-900">Driver Allowance</span>
                      </div>
                      <p className="text-yellow-800">₹{tariffData.driverAllowance.replace(/[₹$]/g, '').trim()} per day</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Features & Services */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg border-0">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Shield className="h-6 w-6 mr-3 text-admin-primary" />
                      What's Included
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">Professional & Experienced Driver</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">Clean & Well-maintained Vehicle</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">24/7 Customer Support</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">On-time Pickup & Drop</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">GPS Tracking for Safety</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">Comfortable Seating</span>
                      </div>
                    </div>
                    
                    {tariffData.additionalCharges && tariffData.additionalCharges.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Services</h3>
                        <div className="space-y-2">
                          {tariffData.additionalCharges.map((charge, index) => (
                            <div key={index} className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                              <span className="text-gray-700">{charge}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>


            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="sticky top-8"
              >
                <Card className="shadow-2xl border-0">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <div className="text-2xl font-bold text-admin-primary mb-1">
                        ₹{tariffData.oneWayRate.replace(/[₹$]/g, '').replace(/per\s*km/gi, '').replace(/\/km/gi, '').trim()}/km
                      </div>
                      <div className="text-gray-600">One-way rate</div>
                      <div className="text-lg font-semibold text-admin-primary mt-2">
                        ₹{tariffData.roundTripRate.replace(/[₹$]/g, '').replace(/per\s*km/gi, '').replace(/\/km/gi, '').trim()}/km
                      </div>
                      <div className="text-gray-600">Round trip rate</div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Vehicle Type</span>
                        <span className="font-semibold">{tariffData.vehicleType}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Driver Allowance</span>
                        <span className="font-semibold">₹{tariffData.driverAllowance.replace(/[₹$]/g, '').trim()}/day</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Min Distance (One-way)</span>
                        <span className="font-semibold">{tariffData.minimumKmOneWay.replace(/km/gi, '').trim()} km</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600">Availability</span>
                        <span className="font-semibold text-green-600">Available</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={handleBookNow}
                        className="w-full bg-admin-gradient text-white hover:opacity-90 py-3 text-lg font-semibold"
                      >
                        <WhatsAppIcon className="h-5 w-5 mr-2" />
                        Book via WhatsApp
                      </Button>
                      <Button
                        onClick={handleModalBooking}
                        variant="outline"
                        className="w-full border-admin-primary text-admin-primary hover:bg-admin-primary hover:text-white py-3 text-lg font-semibold"
                      >
                        Quick Booking Form
                      </Button>
                      <Button
                        onClick={handleCallNow}
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 text-lg font-semibold"
                      >
                        <Phone className="h-5 w-5 mr-2" />
                        Call for Details
                      </Button>
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Our travel experts are here to help you plan your perfect trip.
                      </p>
                      <div className="text-sm">
                        <div className="flex items-center mb-1">
                          <Phone className="h-4 w-4 mr-2 text-admin-primary" />
                          <span>{contactInfo?.primaryPhone || '+91 90037 82966'}</span>
                        </div>
                        <div className="flex items-center">
                          <WhatsAppIcon className="h-4 w-4 mr-2 text-green-500" />
                          <span>WhatsApp Support</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        prefilledService={tariffData.vehicleName}
      />
    </div>
  );
}