"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-admin-gradient flex items-center justify-center px-4">
      <div className="text-center text-white max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-white/80 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/">
            <Button 
              size="lg" 
              className="bg-white text-admin-primary hover:bg-gray-100 px-8 py-3 font-semibold"
            >
              <Home className="h-5 w-5 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          
          <div className="text-center">
            <button 
              onClick={() => window.history.back()}
              className="text-white/80 hover:text-white transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>

        <div className="mt-12 text-white/60 text-sm">
          <p>Need help? Contact us:</p>
          <div className="mt-2 space-y-1">
            <div>📞 +91 98765 43210</div>
            <div>📧 info@mnt.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}