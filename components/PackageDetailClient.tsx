"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle, 
  X, 
  Calendar,
  Phone,
  Star,
  Camera
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { useContact } from "@/hooks/use-contact";

interface PackageData {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  gallery?: string[];
  duration: string;
  price: string;
  featured?: boolean;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: Array<{
    time: string;
    activity: string;
  }>;
  category: string;
}

interface PackageDetailClientProps {
  packageData: PackageData;
}

export default function PackageDetailClient({ packageData }: PackageDetailClientProps) {
  const { contactInfo } = useContact();

  const handleBookPackage = () => {
    const message = `🏖️ *Package Booking Request*

*Package:* ${packageData.title}
*Duration:* ${packageData.duration}
*Price:* ${packageData.price}

I'm interested in booking this package. Please provide:
- Available dates
- Final pricing
- Booking process

Thank you!`;

    const whatsappNumber = contactInfo?.whatsappNumber || contactInfo?.primaryPhone || '919876543210';
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCallNow = () => {
    const phoneNumber = contactInfo?.primaryPhone || '+919876543210';
    window.open(`tel:${phoneNumber}`, '_self');
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
              href="/packages"
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Link>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-white/20 text-white border-white/30 px-4 py-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  {packageData.category} Package
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {packageData.title}
                </h1>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  {packageData.description}
                </p>
                
                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-semibold">{packageData.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span className="font-semibold">All Group Sizes</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    <span className="font-semibold">4.8 Rating</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleBookPackage}
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
                    src={packageData.image || "/kodaikanal-hill-station.png"}
                    alt={packageData.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      {packageData.price}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      {packageData.gallery && packageData.gallery.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Package Gallery
              </h2>
              <p className="text-gray-600">
                Explore the beautiful destinations and experiences included in this package
              </p>
            </motion.div>
            
            <div className={`grid gap-4 ${
              packageData.gallery.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
              packageData.gallery.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
              packageData.gallery.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto' :
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}>
              {packageData.gallery.filter(image => image && image.trim() !== '').map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
                >
                  <Image
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Package Details */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg border-0">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Star className="h-6 w-6 mr-3 text-admin-primary" />
                      Package Highlights
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {packageData.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Itinerary */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg border-0">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Calendar className="h-6 w-6 mr-3 text-admin-primary" />
                      Travel Places
                    </h2>
                    <div className="space-y-4">
                      {packageData.itinerary.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="bg-admin-gradient text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-4 flex-shrink-0 mt-1">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-admin-primary mb-1">
                              {item.time}
                            </div>
                            <div className="text-gray-700">{item.activity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Inclusions & Exclusions */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="shadow-lg border-0">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                        Inclusions
                      </h3>
                      <div className="space-y-3">
                        {packageData.inclusions.map((inclusion, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{inclusion}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <X className="h-5 w-5 mr-3 text-red-500" />
                        Exclusions
                      </h3>
                      <div className="space-y-3">
                        {packageData.exclusions.map((exclusion, index) => (
                          <div key={index} className="flex items-center">
                            <X className="h-4 w-4 text-red-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{exclusion}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                      <div className="text-3xl font-bold text-admin-primary mb-2">
                        {packageData.price}
                      </div>
                      <div className="text-gray-600">per person</div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-semibold">{packageData.duration}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Category</span>
                        <span className="font-semibold">{packageData.category}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Group Size</span>
                        <span className="font-semibold">Any Size</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600">Booking</span>
                        <span className="font-semibold text-green-600">Available</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={handleBookPackage}
                        className="w-full bg-admin-gradient text-white hover:opacity-90 py-3 text-lg font-semibold"
                      >
                        <WhatsAppIcon className="h-5 w-5 mr-2" />
                        Book via WhatsApp
                      </Button>
                      <Button
                        onClick={handleCallNow}
                        variant="outline"
                        className="w-full border-admin-primary text-admin-primary hover:bg-admin-primary hover:text-white py-3 text-lg font-semibold"
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
                          <span>{contactInfo?.primaryPhone || '+91 98765 43210'}</span>
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
    </div>
  );
}