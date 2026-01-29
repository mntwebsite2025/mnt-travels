import { notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import TariffDetailClient from "@/components/TariffDetailClient";

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    // Construct absolute URL for server-side fetching
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/tariff`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return {
        title: "Tariff Not Found - mnt Tours & Travels",
      };
    }
    
    const data = await response.json();
    const tariff = data.success ? data.data.find((t: any) => t.slug === slug) : null;
    
    if (!tariff) {
      return {
        title: "Tariff Not Found - mnt Tours & Travels",
      };
    }
    
    return {
      title: tariff.seoTitle || `${tariff.vehicleName} - Tariff & Pricing | mnt Tours & Travels`,
      description: tariff.seoDescription || `Book ${tariff.vehicleName} for your travel needs. One-way: ₹${tariff.oneWayRate}/km, Round trip: ₹${tariff.roundTripRate}/km. Professional drivers and clean vehicles.`,
      keywords: tariff.seoKeywords || `${tariff.vehicleName}, ${tariff.vehicleType}, taxi booking, travel tariff, Tamil Nadu taxi`,
    };
  } catch (error) {
    return {
      title: "Tariff Not Found - mnt Tours & Travels",
    };
  }
}

// Fetch tariff data
async function getTariffData(slug: string) {
  try {
    // Construct absolute URL for server-side fetching
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/tariff`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Tariff fetch failed:', await response.text());
      return null;
    }
    
    const data = await response.json();
    const tariff = data.success ? data.data.find((t: any) => t.slug === slug) : null;
    
    return tariff;
  } catch (error) {
    console.error('Error fetching tariff data:', error);
    return null;
  }
}

export default async function TariffDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tariffData = await getTariffData(slug);

  if (!tariffData) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <TariffDetailClient tariffData={tariffData} />
      <Footer />
      <FloatingContactButtons />
    </div>
  );
}

// Generate static params for better performance (optional)
export async function generateStaticParams() {
  try {
    // During build time, fetch directly from database instead of HTTP
    const { default: connectDB } = await import('@/config/models/connectDB');
    const { default: Tariff } = await import('@/config/utils/admin/tariff/tariffSchema');
    
    await connectDB();
    const tariffs = await Tariff.find({ isActive: true }).select('slug').lean();
    
    return tariffs.map((tariff: any) => ({
      slug: tariff.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}