"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"
import axios from "axios"
import Link from "next/link"

export default function ForgotPassword() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  
  // Clear any existing admin token to prevent automatic redirects
  useEffect(() => {
    localStorage.removeItem("admin_token")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter your email address.",
        duration: 3000,
      })
      return
    }

    // Validate email format with stricter regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email Format",
        description: "Please enter a valid email address (e.g., user@example.com)",
        duration: 4000,
      })
      return
    }

    setIsLoading(true)

    try {
      // Dismiss any existing toasts
      toast({
        variant: "default",
        title: "Processing Request",
        description: "Verifying admin account...",
        duration: 2000,
      });

      const response = await axios.post("/api/admin/auth/forgot-password", { email });
      
      if (response.data.success) {
        // Clear form on success
        setEmail("");
        
        // Show success message
        toast({
          variant: "default",
          title: "Reset Link Sent",
          description: "Password reset instructions have been sent to your email.",
          duration: 5000,
        });

        // Additional reminder toast
        setTimeout(() => {
          toast({
            variant: "default",
            title: "Important",
            description: "The reset link will expire in 1 hour. Please check spam folder if not received.",
            duration: 6000,
          });
        }, 1000);
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      let errorTitle = "Request Failed";
      let errorMessage;
      
      if (error.response?.status === 400) {
        errorTitle = "Invalid Email Format";
        errorMessage = "Please enter a valid email address.";
      } else if (error.response?.status === 401) {
        errorTitle = "Account Not Found";
        errorMessage = "The email address you entered is not registered as an admin account.";
      } else if (error.response?.status === 403) {
        errorTitle = "Account Inactive";
        errorMessage = "Your admin account is currently inactive. Please contact support.";
      } else if (error.response?.status === 500) {
        errorTitle = "Server Error";
        errorMessage = "Unable to process your request. Please try again later.";
      } else {
        errorMessage = "An unexpected error occurred. Please try again.";
      }

      // Show single error toast with custom error message from server if available
      toast({
        variant: "destructive",
        title: errorTitle,
        description: error.response?.data?.error || errorMessage,
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-admin-gradient">
        <div className="absolute inset-0 bg-admin-gradient" />

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Pulsing Background Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            delay: 2,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
              <p className="text-gray-300">Enter your email to reset your password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-admin-gradient text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center justify-center w-full p-2 text-sm text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Link>
                </div>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
