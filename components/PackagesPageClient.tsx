"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Phone } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import PopularRoutes from "@/components/PopularRoutes";
import { useBanner } from "@/hooks/use-banner";
import { useContact } from "@/hooks/use-contact";

interface PackageItem {
  id: number;
  title: string;
  description: string;
  image?: string;
  gallery?: string[];
  duration: string;
  price: string;
  featured?: boolean;
  highlights: string[];
  inclusions: string[];
  category: string;
}

interface PackagesPageClientProps {
  packagesData: PackageItem[];
}

export default function PackagesPageClient({ packagesData }: PackagesPageClientProps) {
  const { banner } = useBanner("packages");
  const { contactInfo } = useContact();
  
  const handleBookPackage = (packageTitle: string) => {
    const message = `Hi, I'm interested in the ${packageTitle} package. Please provide more details and availability.`;
    const whatsappNumber = contactInfo?.whatsappNumber || contactInfo?.primaryPhone || '919003782966';
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

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
                alt={banner?.title || "Tour Packages"}
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
              <MapPin className="h-4 w-4 mr-2" />
              Tour Packages
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Discover Amazing Destinations
              <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 font-normal">
                Unforgettable Travel Experiences
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Experience rich culture, stunning landscapes, and spiritual heritage 
              with our expertly designed travel packages.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-yellow-50/30 to-orange-50/30">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 px-2">
              Explore Our
              <span className="block text-transparent bg-clip-text bg-admin-gradient">
                Travel Packages
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xs sm:max-w-xl md:max-w-2xl mx-auto px-2">
              Choose from our handpicked destinations and unforgettable experiences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {packagesData.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl hover:text-admin-primary transition-all duration-300 group overflow-hidden border-0 shadow-lg flex flex-col">
                  <div className="aspect-[3/2] overflow-hidden relative flex-shrink-0">
                    <img
                      src={pkg.image || `/kodaikanal-hill-station.png`}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className={`${
                        pkg.featured 
                          ? 'bg-green-500 text-white' 
                          : 'bg-admin-gradient text-white'
                      } backdrop-blur-sm`}>
                        {pkg.featured ? '⭐ Bestseller' : pkg.category}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{pkg.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{pkg.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-3 sm:p-4 md:p-6 flex flex-col flex-grow">
                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 transition-colors line-clamp-2">
                        {pkg.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed line-clamp-3 flex-grow">
                        {pkg.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-admin-gradient">
                        {pkg.price}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">per person</div>
                    </div>

                    {/* Highlights */}
                    <div className="mb-4 sm:mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm">Top Highlights:</h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {pkg.highlights.slice(0, 3).map((highlight, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                        {pkg.highlights.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{pkg.highlights.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div className="mb-4 sm:mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm">Package Includes:</h4>
                      <div className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {pkg.inclusions.join(' • ')}
                      </div>
                    </div>

                    {/* Button Container - Fixed at bottom */}
                    <div className="mt-auto space-y-2 sm:space-y-3">
                      <Button
                        onClick={() => handleBookPackage(pkg.title)}
                        className="w-full bg-admin-gradient text-white group-hover:shadow-lg text-xs sm:text-sm h-8 sm:h-10"
                      >
                        <span className="hidden sm:inline">Book This Package</span>
                        <span className="sm:hidden">Book Now</span>
                      </Button>
                      <Link
                        href={`/packages/${pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}
                        className="block text-center text-admin-primary hover:text-admin-secondary transition-colors font-medium text-xs sm:text-sm py-1 sm:py-2"
                      >
                        <span className="hidden sm:inline">View Full Details →</span>
                        <span className="sm:hidden">Details →</span>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <PopularRoutes showAll={true} />

      {/* Custom Package Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Want a Personalized Trip?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Let us create a custom travel experience tailored to your interests, budget, and schedule
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                const phoneNumber = contactInfo?.primaryPhone || '+919003782966';
                window.open(`tel:${phoneNumber}`, '_blank');
              }}
              className="bg-admin-gradient text-white hover:opacity-90"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call for Custom Trip
            </Button>
            <Button
              onClick={() => {
                const whatsappNumber = contactInfo?.whatsappNumber || contactInfo?.primaryPhone || '919003782966';
                window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi, I would like to plan a personalized trip. Please help me create a custom travel package.`, '_blank');
              }}
              variant="outline"
              className="border-admin-primary text-admin-primary hover:bg-admin-gradient hover:text-white"
            >
              WhatsApp Us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}