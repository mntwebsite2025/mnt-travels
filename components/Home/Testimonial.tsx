"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

interface Testimonial {
  _id: string;
  name: string;
  location: string;
  avatar: string;
  content: string;
  rating: number;
  servicesType: string;
  status: string;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

export const Testimonials = ({ testimonials = [] }: TestimonialsProps) => {
  // Filter to show only published testimonials
  const activeTestimonials = testimonials.filter(
    (testimonial) => testimonial.status === "published"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? activeTestimonials.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % activeTestimonials.length);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (activeTestimonials.length === 0 || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex(
        (prevIndex) => (prevIndex + 1) % activeTestimonials.length
      );
    }, 4000); // Change testimonial every 4 seconds

    return () => clearInterval(interval);
  }, [activeTestimonials.length, isAutoPlaying]);

  // Simplified responsive scroll calculations
  const getScrollDistance = () => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 640) return 290; // Mobile: full card width + gap
      if (width < 1024) return 330; // Tablet: card width + gap
      return 350; // Desktop: card width + gap
    }
    return 350; // Default for SSR
  };

  if (activeTestimonials.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50"></div>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative">
          <div className="text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              No testimonials available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50"></div>
      <div className="container mx-auto px-2 sm:px-4 md:px-6 relative">
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Badge className="mb-4 sm:mb-6 bg-admin-gradient text-white px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Testimonials
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 px-2">
            What Our Clients
            <span className="block bg-admin-gradient bg-clip-text text-transparent">
              Say About Us
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">
            Don't just take our word for it - hear from our satisfied clients
          </p>
        </motion.div>

        {/* Testimonials container with navigation arrows */}
        <div className="relative overflow-hidden w-full px-1 sm:px-3">
          {/* Previous Arrow */}
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-700" />
          </Button>

          {/* Next Arrow */}
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-700" />
          </Button>

          {/* Testimonials slider */}
          <motion.div
            className="flex gap-3 justify-center sm:gap-4 md:gap-6"
            animate={{
              x: -currentIndex * getScrollDistance(),
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
            style={{
              width: activeTestimonials.length <= 3 ? 'auto' : `${activeTestimonials.length * getScrollDistance()}px`
            }}
          >
              {/* Show testimonials without duplication */}
              {activeTestimonials.map(
              (testimonial, index) => (
                <motion.div
                key={testimonial._id}
                  className="flex-shrink-0 w-[270px] sm:w-[310px] lg:w-[330px]"
                  variants={fadeInUp}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md h-full">
                    <CardContent className="p-4 sm:p-6">
                      {/* Star Rating */}
                      <div className="flex mb-3 sm:mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>

                      {/* Testimonial Content */}
                      <p className="text-gray-600 mb-4 sm:mb-6 italic leading-relaxed text-sm sm:text-base line-clamp-4">
                        "{testimonial.content}"
                      </p>

                      {/* Author Info */}
                      <div className="flex items-center">
                        <img
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 border-2 border-gray-200 object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">
                            {testimonial.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            {testimonial.location}
                          </div>
                          <div className="text-xs bg-admin-gradient bg-clip-text text-transparent font-medium">
                            {testimonial.servicesType}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            )}
          </motion.div>
        </div>

      </div>
    </section>
  );
};
