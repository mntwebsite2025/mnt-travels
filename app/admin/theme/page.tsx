"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/providers/theme";
import {
  Palette,
  Eye,
  Save,
  RotateCcw,
  Monitor,
  Smartphone,
  Tablet,
  ImageIcon,
  Upload,
  Plane,
  MapPin,
  Camera,
  Star,
  Users,
  Phone,
  Mail,
} from "lucide-react";

export default function ThemePage() {
  const { toast } = useToast();
  const { themeData, loading: themeLoading, refreshTheme } = useTheme();
  
  const [siteName, setSiteName] = useState("mnt Tours & Travels");
  const [logo, setLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#F59E0B"); // Gold for travel theme
  const [secondaryColor, setSecondaryColor] = useState("#1F2937"); // Dark navy for travel theme
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [loading, setLoading] = useState(false);

  // Load theme data when component mounts
  useEffect(() => {
    if (themeData) {
      setSiteName(themeData.siteName);
      setLogo(themeData.logo);
      setFavicon(themeData.favicon);
      setPrimaryColor(themeData.primaryColor);
      setSecondaryColor(themeData.secondaryColor);
    }
  }, [themeData]);

  // Handle save theme settings
  const saveThemeSettings = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteName,
          logo,
          favicon,
          primaryColor,
          secondaryColor,
          gradientDirection: '135deg'
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Theme settings saved successfully",
        });
        await refreshTheme(); // Refresh theme data
      } else {
        throw new Error(result.message || 'Failed to save theme');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save theme settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle reset theme settings
  const resetThemeSettings = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/theme', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        // Update local state with default values
        setSiteName("mnt Tours & Travels");
        setPrimaryColor("#F59E0B");
        setSecondaryColor("#1F2937");
        setLogo("/mnt-tours-logo.png");
        setFavicon(null);
        
        toast({
          title: "Success",
          description: "Theme settings reset to default",
        });
        await refreshTheme(); // Refresh theme data
      } else {
        throw new Error(result.message || 'Failed to reset theme');
      }
    } catch (error) {
      console.error('Error resetting theme:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset theme settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFavicon(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPreviewContainerClass = () => {
    switch (previewDevice) {
      case "tablet":
        return "max-w-md mx-auto";
      case "mobile":
        return "max-w-sm mx-auto";
      default:
        return "w-full";
    }
  };/*  */

  // Create dynamic gradient based on primary and secondary colors
  const getDynamicGradient = () => {
    return `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-admin-gradient bg-clip-text text-transparent flex items-center gap-3">
            <Palette className="h-8 w-8" style={{ color: primaryColor }} />
            Theme Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Customize your travel website's appearance and branding to match your unique style
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={resetThemeSettings}
            variant="outline"
            className="flex items-center bg-transparent"
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={saveThemeSettings}
            className="flex items-center bg-admin-gradient text-white"
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Theme Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Site Name */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" style={{ color: primaryColor }} />
                Site Information
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                  Basic Settings
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Site Name
                </Label>
                <Input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Enter your site name"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  This will appear in the browser title and throughout the website
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Logo & Favicon */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" style={{ color: primaryColor }} />
                Brand Assets
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full ml-2">
                  Travel Branding
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 grid grid-cols-2">
              {/* Logo Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Website Logo
                </Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {logo ? (
                      <img
                        src={logo || "/placeholder.svg"}
                        alt="Logo"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Label
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </Label>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: PNG or SVG format, max 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Favicon Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Favicon
                </Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {favicon ? (
                      <img
                        src={favicon || "/placeholder.svg"}
                        alt="Favicon"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconUpload}
                      className="hidden"
                      id="favicon-upload"
                    />
                    <Label
                      htmlFor="favicon-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Favicon
                    </Label>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: 32x32px ICO or PNG format
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Settings */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" style={{ color: primaryColor }} />
                Color Settings
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">
                  Travel Themes
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Primary Color */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Primary Color
                </Label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  ></div>
                  <div className="flex-1">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full h-12"
                    />
                  </div>
                  <div className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-2 rounded">
                    {primaryColor}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  This color will be applied to buttons, links, and accent
                  elements throughout the website.
                </p>
              </div>

              {/* Secondary Color */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Secondary Color
                </Label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: secondaryColor }}
                  ></div>
                  <div className="flex-1">
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full h-12"
                    />
                  </div>
                  <div className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-2 rounded">
                    {secondaryColor}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  This color will be used for backgrounds, cards, and secondary
                  elements.
                </p>
              </div>

              {/* Advanced Gradient Color Presets */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">
                  Advanced Gradient Presets
                </Label>

                {/* Travel-Themed Gradient Collection */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Plane className="w-4 h-4" />
                    Travel & Tourism Gradients
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        name: "mnt Gold",
                        primary: "#F59E0B",
                        secondary: "#1F2937",
                        description: "Brand Colors",
                        icon: "⭐",
                      },
                      {
                        name: "Ocean Breeze",
                        primary: "#0ea5e9",
                        secondary: "#06b6d4",
                        description: "Beach Vibes",
                        icon: "🌊",
                      },
                      {
                        name: "Sunset Paradise",
                        primary: "#FFDE00",
                        secondary: "#EF4444",
                        description: "Golden Hour",
                        icon: "🌅",
                      },
                      {
                        name: "Mountain Peak",
                        primary: "#10b981",
                        secondary: "#059669",
                        description: "Adventure",
                        icon: "🏔️",
                      },
                      {
                        name: "Desert Safari",
                        primary: "#FFDE00",
                        secondary: "#D97706",
                        description: "Desert Tours",
                        icon: "🐪",
                      },
                      {
                        name: "Tropical Sky",
                        primary: "#3b82f6",
                        secondary: "#6366f1",
                        description: "Island Escape",
                        icon: "🏝️",
                      },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setPrimaryColor(preset.primary);
                          setSecondaryColor(preset.secondary);
                        }}
                        className="group relative p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all hover:scale-105"
                        title={`${preset.name} - ${preset.description}`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2 relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`,
                          }}
                        >
                          <div className="absolute top-1 right-1 text-xs opacity-80">
                            {preset.icon}
                          </div>
                        </div>
                        <div className="text-xs text-gray-700 font-medium">
                          {preset.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination-Inspired Gradients */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Destination-Inspired Colors
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        name: "Goa Sunset",
                        primary: "#FFDE00",
                        secondary: "#EC4899",
                        description: "Beach Paradise",
                        icon: "🏖️",
                      },
                      {
                        name: "Kerala Backwaters",
                        primary: "#10b981",
                        secondary: "#FFDE00",
                        description: "Nature's Beauty",
                        icon: "🛶",
                      },
                      {
                        name: "Himalayan Dawn",
                        primary: "#6366f1",
                        secondary: "#ec4899",
                        description: "Mountain Majesty",
                        icon: "🏔️",
                      },
                      {
                        name: "Rajasthan Royal",
                        primary: "#DC2626",
                        secondary: "#FFDE00",
                        description: "Royal Heritage",
                        icon: "🏰",
                      },
                      {
                        name: "Kashmir Valley",
                        primary: "#10b981",
                        secondary: "#3B82F6",
                        description: "Paradise on Earth",
                        icon: "🌸",
                      },
                      {
                        name: "Mumbai Nights",
                        primary: "#000000",
                        secondary: "#FFDE00",
                        description: "City Lights",
                        icon: "🌃",
                      },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setPrimaryColor(preset.primary);
                          setSecondaryColor(preset.secondary);
                        }}
                        className="group relative p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all hover:scale-105"
                        title={`${preset.name} - ${preset.description}`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2 relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`,
                          }}
                        >
                          <div className="absolute top-1 right-1 text-xs opacity-80">
                            {preset.icon}
                          </div>
                        </div>
                        <div className="text-xs text-gray-700 font-medium">
                          {preset.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Professional Travel Gradients */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Professional Travel Themes
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      {
                        name: "Corporate Travel",
                        primary: "#1e40af",
                        secondary: "#3b82f6",
                        description: "Business",
                        icon: "💼",
                      },
                      {
                        name: "Eco Tourism",
                        primary: "#059669",
                        secondary: "#10b981",
                        description: "Sustainable",
                        icon: "🌱",
                      },
                      {
                        name: "Luxury Travel",
                        primary: "#000000",
                        secondary: "#FFDE00",
                        description: "Premium",
                        icon: "✨",
                      },
                      {
                        name: "Adventure Tours",
                        primary: "#7c3aed",
                        secondary: "#a855f7",
                        description: "Thrilling",
                        icon: "🎒",
                      },
                      {
                        name: "Cultural Tours",
                        primary: "#DC2626",
                        secondary: "#FFDE00",
                        description: "Heritage",
                        icon: "🏛️",
                      },
                      {
                        name: "Wellness Retreat",
                        primary: "#0f766e",
                        secondary: "#14b8a6",
                        description: "Peaceful",
                        icon: "🧘",
                      },
                      {
                        name: "Family Vacation",
                        primary: "#FFDE00",
                        secondary: "#EC4899",
                        description: "Fun & Safe",
                        icon: "👨‍👩‍👧‍👦",
                      },
                      {
                        name: "Honeymoon Special",
                        primary: "#EC4899",
                        secondary: "#FFDE00",
                        description: "Romantic",
                        icon: "💕",
                      },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setPrimaryColor(preset.primary);
                          setSecondaryColor(preset.secondary);
                        }}
                        className="group relative p-2 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all hover:scale-105"
                        title={`${preset.name} - ${preset.description}`}
                      >
                        <div
                          className="w-full h-6 rounded-md mb-1 relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`,
                          }}
                        >
                          <div className="absolute top-0 right-0 text-xs opacity-70">
                            {preset.icon}
                          </div>
                        </div>
                        <div className="text-xs text-gray-700 font-medium">
                          {preset.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Click on any gradient preset to instantly apply the color
                  combination. Each preset is optimized for different use cases
                  and brand personalities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0 sticky top-8">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" style={{ color: primaryColor }} />
                Live Preview
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full ml-2">
                  Real-time
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Device Preview Tabs */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    previewDevice === "desktop"
                      ? "bg-white shadow-sm"
                      : "text-gray-600"
                  }`}
                  onClick={() => setPreviewDevice("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                  Desktop
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    previewDevice === "tablet"
                      ? "bg-white shadow-sm"
                      : "text-gray-600"
                  }`}
                  onClick={() => setPreviewDevice("tablet")}
                >
                  <Tablet className="h-4 w-4" />
                  Tablet
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    previewDevice === "mobile"
                      ? "bg-white shadow-sm"
                      : "text-gray-600"
                  }`}
                  onClick={() => setPreviewDevice("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </button>
              </div>

              {/* Preview Window */}
              <div className={getPreviewContainerClass()}>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg">
                  {/* Header Preview */}
                  <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {logo ? (
                          <img
                            src={logo}
                            alt="Logo"
                            className="w-10 h-10 object-contain rounded-full"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                            style={{ background: getDynamicGradient() }}
                          >
                            V
                          </div>
                        )}
                        <div>
                          <div
                            className="text-lg font-bold"
                            style={{ color: primaryColor }}
                          >
                            {siteName.split(' ')[0] || 'mnt'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {siteName.includes('Tours') ? 'Tours & Travels' : siteName.split(' ').slice(1).join(' ') || 'Tours & Travels'}
                          </div>
                        </div>
                      </div>
                      <div
                        className="px-4 py-2 rounded-lg text-white font-medium text-sm hover:scale-105 transition-transform cursor-pointer"
                        style={{ background: getDynamicGradient() }}
                      >
                        Book Now
                      </div>
                    </div>
                  </div>

                  {/* Hero Section Preview */}
                  <div 
                    className="p-6 text-white text-center relative overflow-hidden"
                    style={{ background: getDynamicGradient() }}
                  >
                    <div className="relative z-10">
                      <div className="text-2xl font-bold mb-3">
                        Explore the World with Us
                      </div>
                      <div className="text-sm opacity-90 mb-4 max-w-md mx-auto">
                        Your trusted travel partner for unforgettable journeys
                      </div>
                      <div className="flex gap-3 justify-center">
                        <button
                          className="px-4 py-2 rounded-lg bg-white font-medium text-sm"
                          style={{ color: primaryColor }}
                        >
                          <Plane className="w-4 h-4 inline mr-2" />
                          Explore Tours
                        </button>
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 opacity-20">
                      <Plane className="w-8 h-8 rotate-45" />
                    </div>
                    <div className="absolute bottom-4 left-4 opacity-20">
                      <Camera className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Featured Tours Section */}
                  <div className="p-6 bg-gray-50">
                    <div className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
                      Popular Destinations
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tour Card 1 */}
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-24 bg-gradient-to-r from-blue-400 to-blue-600 relative">
                          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                          <div className="absolute bottom-2 left-3 text-white">
                            <div className="text-sm font-semibold">Goa Beach Tour</div>
                            <div className="text-xs opacity-90">3 Days • 2 Nights</div>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <MapPin className="w-3 h-3" />
                              Goa, India
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">4.8</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold" style={{ color: primaryColor }}>
                              ₹12,999
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Users className="w-3 h-3" />
                              2-6 People
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tour Card 2 */}
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-24 bg-gradient-to-r from-green-400 to-green-600 relative">
                          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                          <div className="absolute bottom-2 left-3 text-white">
                            <div className="text-sm font-semibold">Kerala Backwaters</div>
                            <div className="text-xs opacity-90">5 Days • 4 Nights</div>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <MapPin className="w-3 h-3" />
                              Kerala, India
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">4.9</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold" style={{ color: primaryColor }}>
                              ₹18,999
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Users className="w-3 h-3" />
                              2-8 People
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Footer Preview */}
                  <div 
                    className="p-4 text-white text-center"
                    style={{ background: getDynamicGradient() }}
                  >
                    <div className="flex items-center justify-center gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4" />
                        +91 98765 43210
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4" />
                        info@mnt.com
                      </div>
                    </div>
                    <div className="text-xs opacity-90">
                      © 2024 mnt Tours & Travels. All rights reserved.
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Buttons */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Button Previews
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Primary Color Button */}
                  <button
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:scale-105"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary Button
                  </button>

                  {/* Gradient Button */}
                  <button
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:scale-105"
                    style={{ background: getDynamicGradient() }}
                  >
                    Gradient Button
                  </button>

                  {/* Secondary Outline Button */}
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all hover:scale-105"
                    style={{
                      borderColor: primaryColor,
                      color: primaryColor,
                      backgroundColor: "transparent",
                    }}
                  >
                    Outline Button
                  </button>

                  {/* Secondary Background Button */}
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: secondaryColor,
                      color: primaryColor,
                    }}
                  >
                    Secondary Button
                  </button>
                </div>
              </div>

              {/* Preview Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Logo: {logo ? "Custom uploaded" : "Default"}</p>
                <p>• Primary Color: {primaryColor}</p>
                <p>• Secondary Color: {secondaryColor}</p>
                <p>• Gradient: Primary → Secondary</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
