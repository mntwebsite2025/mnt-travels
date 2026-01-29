"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRight,
  Car,
  Plane,
  Clock,
  MapPin,
  Users,
  Calendar,
  Shield
} from "lucide-react";

// Static travel services data
const staticServices = [
  {
    _id: '1',
    title: 'One-way Trip',
    description: 'Comfortable one-way travel to your destination with professional drivers and clean vehicles.',
    pricing: { basePrice: 12, currency: 'INR' },
    features: ['Professional Driver', 'Clean Vehicle', 'On-time Service', 'GPS Tracking'],
    isActive: true
  },
  {
    _id: '2',
    title: 'Round Trip',
    description: 'Complete round trip service with flexible timing and comfortable travel experience.',
    pricing: { basePrice: 20, currency: 'INR' },
    features: ['Flexible Timing', 'Wait Time Included', 'Return Journey', 'Comfortable Seating'],
    isActive: true
  },
  {
    _id: '3',
    title: 'Airport Taxi',
    description: 'Reliable airport pickup and drop services available 24/7 with flight tracking.',
    pricing: { basePrice: 15, currency: 'INR' },
    features: ['24/7 Available', 'Flight Tracking', 'Meet & Greet', 'Luggage Assistance'],
    isActive: true
  },
  {
    _id: '4',
    title: 'Day Rental',
    description: 'Full day vehicle rental for local sightseeing and business trips with fuel included.',
    pricing: { basePrice: 2500, currency: 'INR' },
    features: ['8 Hours Service', 'Local Sightseeing', 'Fuel Included', '80 KM Limit'],
    isActive: true
  },
  {
    _id: '5',
    title: 'Hourly Package',
    description: 'Flexible hourly rental service for short trips and quick errands within city limits.',
    pricing: { basePrice: 300, currency: 'INR' },
    features: ['Minimum 2 Hours', 'Flexible Timing', 'City Limits', 'Quick Service'],
    isActive: true
  },
  {
    _id: '6',
    title: 'Local Pickup/Drop',
    description: 'Quick and reliable local pickup and drop services within city limits.',
    pricing: { basePrice: 200, currency: 'INR' },
    features: ['Within City Limits', 'Quick Service', 'Affordable Rates', 'Safe Travel'],
    isActive: true
  }
];

export default function Services() {
  const handleBookNow = (serviceTitle: string) => {
    // For homepage services, scroll to the quick book form and prefill service
    const formElement = document.getElementById('quick-book-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Trigger a custom event to prefill the service
      window.dispatchEvent(new CustomEvent('prefillService', { detail: serviceTitle }));
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-4 sm:mb-6 bg-admin-gradient text-white px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm">
            Our Services
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 px-2">
            Professional Travel
            <span className="block text-transparent bg-clip-text bg-admin-gradient">
              Services
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-2">
            From airport transfers to complete tour packages, we provide reliable and comfortable travel solutions across Tamil Nadu
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {staticServices.map((service, index) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-105 h-full">
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden rounded-t-lg bg-admin-gradient">
                    <img
                      src={
                        service.title === 'One-way Trip' ? '/toyota-etios-sedan-taxi.png' :
                        service.title === 'Round Trip' ? '/toyota-innova-taxi.png' :
                        service.title === 'Airport Taxi' ? '/airport-taxi.png' :
                        service.title === 'Day Rental' ? '/maruti-brezza-suv-taxi.png' :
                        service.title === 'Hourly Package' ? '/wagon-r-taxi.png' :
                        '/modern-taxi-fleet-in-tamil-nadu.png'
                      }
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/20 text-white border-white/30">
                        ₹{service.pricing.basePrice}+
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
                      {service.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 md:mb-6 flex-1">
                      {service.description}
                    </p>
                    
                    {service.features && service.features.length > 0 && (
                      <div className="mb-4">
                        <ul className="space-y-1">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-admin-primary rounded-full mr-2"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <Button
                        onClick={() => handleBookNow(service.title)}
                        className="bg-admin-gradient text-white hover:opacity-90"
                      >
                        Book Now
                      </Button>
                      <Link
                        href="/tariff"
                        className="text-admin-primary hover:text-admin-secondary transition-colors font-medium text-sm"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1 inline" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Link href="/tariff">
            <Button className="bg-admin-gradient text-white hover:opacity-90 px-8 py-3 text-lg font-semibold hover:scale-105 transition-all duration-300">
              Explore All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Service Categories Overview */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          {[
            {
              icon: <Car className="h-8 w-8" />,
              title: "Local Transport",
              description: "City rides, pickup/drop services"
            },
            {
              icon: <Plane className="h-8 w-8" />,
              title: "Airport Transfer",
              description: "Reliable airport taxi services"
            },
            {
              icon: <Clock className="h-8 w-8" />,
              title: "Hourly Rental",
              description: "Flexible hourly booking options"
            },
            {
              icon: <MapPin className="h-8 w-8" />,
              title: "Tour Packages",
              description: "Complete travel packages"
            }
          ].map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:scale-105"
            >
              <div className="bg-admin-gradient/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-admin-gradient group-hover:text-white transition-all duration-300">
                {category.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-gray-600 text-sm">{category.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}