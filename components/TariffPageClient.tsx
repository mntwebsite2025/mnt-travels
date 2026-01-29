"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Phone, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import BookingModal from "@/components/BookingModal";
import PopularRoutes from "@/components/PopularRoutes";
import { useBanner } from "@/hooks/use-banner";

interface TariffItem {
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

interface TariffPageClientProps {
  tariffData: TariffItem[];
}

export default function TariffPageClient({ tariffData }: TariffPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  const handleBookNow = (vehicleName: string) => {
    setSelectedService(vehicleName);
    setIsModalOpen(true);
  };

  // Utility functions to clean display values
  const formatCurrency = (value: string) => {
    if (!value) return "0";
    // Remove existing currency symbols and "per km" text
    const cleaned = value.replace(/[₹$]/g, '').replace(/per\s*km/gi, '').replace(/\/km/gi, '').trim();
    return cleaned;
  };

  const formatDistance = (value: string) => {
    if (!value) return "0";
    // Remove existing "km" text
    const cleaned = value.replace(/km/gi, '').trim();
    return cleaned;
  };

  const formatDriverAllowance = (value: string) => {
    if (!value) return "0";
    // Remove existing currency symbols
    const cleaned = value.replace(/[₹$]/g, '').trim();
    return cleaned;
  };

  const { banner } = useBanner("tariff")

  return (
    <>
      {/* Hero Section with Dynamic Banner */}
  <section className="relative bg-admin-gradient text-white py-16 sm:py-20 lg:py-24 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            {/* Image Layer */}
            <div className="absolute inset-0 opacity-100 transition-opacity duration-700">
              <img
                src={banner?.status === "active" && banner?.image ? banner.image : '/placeholder.jpg'}
                alt={banner?.title || "Luxury Taxi Service"}
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
              <Car className="h-4 w-4 mr-2" />
              Travel Tariff & Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Transparent Pricing
              <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 font-normal">
                For All Your Travel Needs
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Discover our competitive rates for all travel services. 
              No hidden charges, just honest pricing for quality service.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tariff Grid */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-yellow-50/30 to-orange-50/30">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 px-2">
              Our Service
              <span className="block text-transparent bg-clip-text bg-admin-gradient">
                Tariff
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xs sm:max-w-xl md:max-w-2xl mx-auto px-2">
              Choose from our range of travel services with transparent pricing
            </p>
          </div>

          {tariffData.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No tariff services available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
              {tariffData.map((tariff, index) => (
                <motion.div
                  key={tariff.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg overflow-hidden group flex flex-col">
                    <div className="relative h-56 sm:h-64 overflow-hidden flex-shrink-0">
                      <img
                        src={tariff.image || '/toyota-innova-crysta-luxury-taxi.png'}
                        alt={tariff.vehicleName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <Badge className={`${
                          tariff.featured 
                            ? 'bg-yellow-500 text-yellow-900' 
                            : 'bg-admin-gradient text-white'
                        } backdrop-blur-sm`}>
                          {tariff.featured ? '⭐ Featured' : tariff.vehicleType}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          ₹{formatCurrency(tariff.oneWayRate)}/km
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col flex-grow">
                      <div className="text-center mb-4 sm:mb-6 md:mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                          <Car className="h-4 w-4 text-admin-primary flex-shrink-0" />
                          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 transition-colors line-clamp-2">
                            {tariff.vehicleName}
                          </h3>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3">
                          {tariff.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-transparent bg-clip-text bg-admin-gradient">
                            ₹{formatCurrency(tariff.oneWayRate)}/km
                          </div>
                          <div className="text-xs text-gray-500">One Way</div>
                          <div className="text-xs text-gray-400">Min: {formatDistance(tariff.minimumKmOneWay)} km</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-transparent bg-clip-text bg-admin-gradient">
                            ₹{formatCurrency(tariff.roundTripRate)}/km
                          </div>
                          <div className="text-xs text-gray-500">Round Trip</div>
                          <div className="text-xs text-gray-400">Min: {formatDistance(tariff.minimumKmRoundTrip)} km</div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">Driver Allowance: ₹{formatDriverAllowance(tariff.driverAllowance)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">Professional Driver</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">Clean & Comfortable Vehicle</span>
                        </div>
                        {tariff.additionalCharges && tariff.additionalCharges.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{tariff.additionalCharges[0]}</span>
                          </div>
                        )}
                      </div>

                      {/* Button Container - Fixed at bottom */}
                      <div className="mt-auto space-y-3">
                        <Button
                          onClick={() => handleBookNow(tariff.vehicleName)}
                          className="w-full bg-admin-gradient text-white hover:opacity-90 transition-all duration-300"
                        >
                          Book Now
                        </Button>
                        <Link
                          href={`/tariff/${tariff.slug}`}
                          className="block text-center text-admin-primary hover:text-admin-secondary transition-colors font-medium text-sm py-2"
                        >
                          View Details →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Routes Section */}
      <PopularRoutes showAll={true} />

      {/* Custom Tariff Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Need a Custom Quote?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Let us create personalized pricing based on your specific travel requirements and route
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.open('tel:+919003782966', '_blank')}
              className="bg-admin-gradient text-white hover:opacity-90"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call for Custom Quote
            </Button>
            <Button
              onClick={() => window.open('https://wa.me/919003782966?text=Hi, I would like to get a custom quote for travel services. Please help me with personalized pricing for my route.', '_blank')}
              variant="outline"
              className="border-admin-primary text-admin-primary hover:bg-admin-gradient hover:text-white"
            >
              WhatsApp Us
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        prefilledService={selectedService}
      />
    </>
  );
}