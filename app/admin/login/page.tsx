"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button'
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Lock, Mail, Shield, Sparkles, Loader2 } from "lucide-react"
import axios from "axios"

export default function AdminLogin() {
  const { toast } = useToast()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (token) {
      // Verify token
      axios.get("/api/admin/auth/verify", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })
      .then((response) => {
        if (response.data.success) {
          router.push("/admin")
        } else {
          localStorage.removeItem("admin_token")
        }
      })
      .catch((error) => {
        console.error("Token verification error:", error)
        localStorage.removeItem("admin_token")
      })
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Email and password are required.",
        duration: 3000,
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        duration: 3000,
      })
      return
    }

    setIsLoading(true)

    try {
      toast({
        variant: "default",
        title: "Logging in...",
        description: "Please wait while we verify your credentials",
        duration: 2000,
      })
      
      console.log('Attempting login with email:', formData.email);
      
      const response = await axios.post("/api/admin/auth/login", formData)
      
      const { token, admin } = response.data
      
      if (!token || !admin) {
        console.error('Invalid server response:', response.data);
        throw new Error("Invalid response from server")
      }
      
      // Store token
      localStorage.setItem("admin_token", token)
      
      console.log('Login successful for:', admin.email);
      
      toast({
        variant: "default",
        title: "Welcome Back!",
        description: `Successfully logged in as ${admin.firstName}`,
        duration: 3000,
      })

      // Small delay to show success message, then navigate
      setTimeout(() => {
        router.push("/admin")
      }, 1000)
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "An error occurred during login. Please try again."
      let errorTitle = "Login Failed"
      
      if (error.response?.status === 401) {
        errorTitle = "Invalid Credentials"
        errorMessage = "The email or password you entered is incorrect."
      } else if (error.response?.status === 403) {
        errorTitle = "Account Inactive"
        errorMessage = "Your account has been deactivated. Please contact support."
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: error.response?.data?.error || errorMessage,
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)

    try {
      toast({
        variant: "default",
        title: "Demo Login",
        description: "Logging in with demo credentials...",
        duration: 2000,
      })
      
      const demoCredentials = {
        email: "mnt0450@gmail.com",
        password: "mnt@2025"
      }
      
      const response = await axios.post("/api/admin/auth/login", demoCredentials)
      
      const { token, admin } = response.data
      
      if (!token || !admin) {
        throw new Error("Invalid response from server")
      }
      
      localStorage.setItem("admin_token", token)
      
      toast({
        variant: "default",
        title: "Demo Access Granted!",
        description: `Welcome to the demo dashboard`,
        duration: 3000,
      })

      setTimeout(() => {
        router.push("/admin")
      }, 1000)
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast({
        variant: "destructive",
        title: "Demo Login Failed",
        description: "Unable to access demo account. Please try again.",
        duration: 4000,
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

      {/* Login Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Logo Section */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-admin-gradient rounded-2xl mb-4 shadow-2xl relative">
              <Shield className="h-10 w-10 text-white" />
              <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
              mnt Tours
            </h1>
            <p className="text-blue-200 text-lg">Admin Portal</p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-white mb-2">Welcome Back</CardTitle>
                <p className="text-blue-200">Sign in to access your dashboard</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                        placeholder="Enter your email"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                        placeholder="Enter your password"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white hover:bg-white/10"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link 
                      href="/admin/login/forgot-password" 
                      className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-admin-gradient text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* Demo Login Button */}
                  <Button
                    type="button"
                    onClick={handleDemoLogin}
                    className="w-full bg-white text-gray-900 font-semibold py-3 shadow-lg hover:bg-blue-500 hover:text-white transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Accessing Demo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Try Demo Login
                      </>
                    )}
                  </Button>
                </form>

                {/* Google Sign In */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-blue-200 bg-white/10 backdrop-blur-sm rounded">
                      Or continue with
                    </span>
                  </div>
                </div>

                <GoogleSignInButton />

                {/* Security Notice */}
                <motion.div
                  className="mt-4 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-300" />
                    <span className="text-sm font-medium text-blue-200">Security Notice</span>
                  </div>
                  <p className="text-xs text-blue-300 leading-relaxed">
                    This is a secure admin portal. All login attempts are monitored and logged for security purposes.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <p className="text-blue-200 text-sm">© 2025 mnt Tours & Travels. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

  