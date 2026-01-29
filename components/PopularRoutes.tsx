"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Car } from "lucide-react";
import Link from "next/link";
import { useContact } from "@/hooks/use-contact";

interface PopularRoute {
  _id: string;
  name: string;
  isActive: boolean;
  isPopularRoute: boolean;
  order: number;
}

interface PopularRoutesProps {
  showAll?: boolean;
  limit?: number;
}

export default function PopularRoutes({ showAll = false, limit = 12 }: PopularRoutesProps) {
  const { contactInfo } = useContact();
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback routes if API fails
  const fallbackRoutes = [
    'Chennai',
    'Madurai', 
    'Coimbatore',
    'Kodaikanal',
    'Ooty',
    'Bangalore',
    'Kerala',
    'Salem',
    'Trichy',
    'Thanjavur',
    'Rameswaram',
    'Kanyakumari'
  ];

  // Fetch popular routes from API
  useEffect(() => {
    const fetchPopularRoutes = async () => {
      try {
        const response = await fetch('/api/admin/locations');
        const result = await response.json();
        
        if (result.success) {
          // Filter only popular routes and sort by order
          const routes = result.data
            .filter((location: PopularRoute) => location.isActive && location.isPopularRoute)
            .map((location: PopularRoute) => ({
              ...location,
              name: location.name.replace(/\s*drop\s*taxi/gi, '').trim()
            }))
            .sort((a: PopularRoute, b: PopularRoute) => a.order - b.order);
          setPopularRoutes(routes);
        }
      } catch (error) {
        console.error('Error fetching popular routes:', error);
        // Use fallback routes
        const fallbackData = fallbackRoutes.map((route, index) => ({
          _id: `fallback-${index}`,
          name: route,
          isActive: true,
          isPopularRoute: true,
          order: index
        }));
        setPopularRoutes(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularRoutes();
  }, []);

  // Use fallback if no routes found
  const routesToDisplay = popularRoutes.length > 0 
    ? popularRoutes 
    : fallbackRoutes.map((route, index) => ({
        _id: `fallback-${index}`,
        name: route,
        isActive: true,
        isPopularRoute: true,
        order: index
      }));

  const displayRoutes = showAll ? routesToDisplay : routesToDisplay.slice(0, limit);

  const handleBookRoute = (routeName: string) => {
    const message = `Hi, I'd like to book ${routeName}. Please provide availability and confirm the fare.`;
    const whatsappNumber = contactInfo?.whatsappNumber || contactInfo?.primaryPhone || '919003782966';
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-admin-gradient relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-yellow-600/30 via-transparent to-orange-600/30"
          animate={{
            opacity: [0.3, 0.7, 0.3],
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



      {/* Small floating bubbles like About section */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-white/30 rounded-full"
            style={{
              left: `${5 + i * 8}%`,
              top: `${10 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              x: [-10, 10, -10],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 5 + i * 0.3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl relative z-10">
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-4 sm:mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Popular Routes
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 px-2">
            <span className="text-yellow-200">
              Most Traveled Routes
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-2">
            Book taxi services to popular destinations with professional drivers
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className={`grid gap-3 sm:gap-4 justify-center ${
            displayRoutes.length <= 2 
              ? 'grid-cols-2 max-w-md mx-auto' 
              : displayRoutes.length <= 4
              ? 'grid-cols-2 sm:grid-cols-4 max-w-2xl mx-auto'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
          }`}>
            {displayRoutes.map((route, index) => (
              <motion.div
                key={route._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Button
                  onClick={() => handleBookRoute(route.name)}
                  variant="outline"
                  className="w-full h-full min-h-[80px] p-3 sm:p-4 text-center border-2 border-gray-200 
                      hover:border-admin-primary hover:bg-admin-gradient hover:text-white 
                      transition-all duration-300 text-xs sm:text-sm font-medium text-gray-700 
                      rounded-lg flex flex-col items-center justify-center gap-2 overflow-hidden"
                >
                  <Car className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="line-clamp-2 text-center break-words">
    {route.name}
  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {!showAll && routesToDisplay.length > limit && (
          <div className="text-center mt-8">
            <Link href="/tariff">
              <Button className="bg-admin-gradient text-white hover:opacity-90 px-6 py-2 text-base font-medium">
                View All Routes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}