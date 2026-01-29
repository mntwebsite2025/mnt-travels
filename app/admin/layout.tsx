"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  Search,
  Users,
  MessageSquare,
  Palette,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Settings,
  Briefcase,
  Phone,
  PanelLeftClose,
  PanelLeft,
  MapPin,
} from "lucide-react"
import { Suspense } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Image from "next/image"
import { Toaster } from "@/components/ui/toaster"
import { useTheme } from "@/components/providers/theme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from "axios"

interface AdminProfile {
  firstName: string
  lastName: string
  email: string
  avatar: string
  role: string
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { themeData } = useTheme()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Initialize from localStorage if available, default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen')
      return saved !== null ? JSON.parse(saved) : true
    }
    return true
  })

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen((prev: boolean): boolean => {
      const newState: boolean = !prev
      // Save to localStorage immediately
      localStorage.setItem('sidebarOpen', JSON.stringify(newState))
      return newState
    })
  }
  const [pageManagerOpen, setPageManagerOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Save sidebar state to localStorage (redundant now, but keeping for safety)
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen))
  }, [sidebarOpen])

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Don't auto-open/close on resize, let user control it
      // Only ensure it's responsive to screen size changes
      if (window.innerWidth < 1024 && sidebarOpen) {
        // Optional: Close sidebar on mobile when resizing down
        // setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarOpen])

  // Fetch admin profile data
  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      if (!token) return

      const response = await axios.get("/api/admin/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setAdminProfile(response.data.admin)
      }
    } catch (error) {
      console.error("Failed to fetch admin profile:", error)
    }
  }

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const token = localStorage.getItem("admin_token")
      const publicPaths = [
        "/admin/login",
        "/admin/login/forgot-password",
        "/admin/login/reset-password"
      ]

      if (token) {
        setIsAuthenticated(true)
        // Fetch admin profile data when authenticated
        await fetchAdminProfile()
      } else {
        setIsAuthenticated(false)
        // Only redirect to login if not on a public path
        if (!publicPaths.some(path => pathname.startsWith(path))) {
          router.push("/admin/login")
        }
      }
      setIsLoading(false)
    }

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkAuth, 100)

    return () => clearTimeout(timer)
  }, [pathname, router])

  // Listen for profile updates (when user updates profile in settings)
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchAdminProfile()
    }

    // Listen for custom profile update event
    window.addEventListener('adminProfileUpdated', handleProfileUpdate)
    
    return () => {
      window.removeEventListener('adminProfileUpdated', handleProfileUpdate)
    }
  }, [])

  useEffect(() => {
    // Auto-expand Page Manager if we're on any of its sub-pages
    if (
      pathname.includes("/admin/packages") ||
      pathname.includes("/admin/tariff") ||
      pathname.includes("/admin/banners") ||
      pathname.includes("/admin/contact")
    ) {
      setPageManagerOpen(true)
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    setIsAuthenticated(false)
    setUserDropdownOpen(false)
    router.push("/admin/login")
  }

  const handleProfileClick = () => {
    setUserDropdownOpen(false)
    router.push("/admin/profile")
  }

  const sidebarItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      color: "text-blue-600",
    },
    {
      name: "Page Manager",
      icon: <FileText className="h-5 w-5" />,
      color: "text-green-600",
      isCollapsible: true,
      subItems: [
        { name: "Packages", href: "/admin/packages", icon: <Settings className="h-4 w-4" /> },
        { name: "Tariff", href: "/admin/tariff", icon: <Briefcase className="h-4 w-4" /> },
        { name: "Banner Manager", href: "/admin/banners", icon: <FileText className="h-4 w-4" /> },
        { name: "Contact", href: "/admin/contact", icon: <Phone className="h-4 w-4" /> },
      ],
    },
    {
      name: "SEO Manager",
      href: "/admin/seo",
      icon: <Search className="h-5 w-5" />,
      color: "text-purple-600",
    },
    {
      name: "Testimonial Manager",
      href: "/admin/testimonials",
      icon: <Users className="h-5 w-5" />,
      color: "text-orange-600",
    },
    {
      name: "Lead Manager",
      href: "/admin/leads",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "text-red-600",
    },
    {
      name: "Location Manager",
      href: "/admin/locations",
      icon: <MapPin className="h-5 w-5" />,
      color: "text-emerald-600",
    },
    {
      name: "Theme Settings",
      href: "/admin/theme",
      icon: <Palette className="h-5 w-5" />,
      color: "text-pink-600",
    },
    {
      name: "Profile Settings",
      href: "/admin/profile",
      icon: <User className="h-5 w-5" />,
      color: "text-indigo-600",
    },
  ]

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          {themeData?.logo ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4 animate-pulse bg-white shadow-lg">
              <Image 
                src={themeData.logo} 
                alt="Website Logo" 
                width={64} 
                height={64} 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-admin-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
          )}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Public pages that don't require authentication
  const publicPaths = [
    "/admin/login",
    "/admin/login/forgot-password",
    "/admin/login/reset-password"
  ]

  // Show login page if not authenticated and not on a public path
  if (!isAuthenticated && !publicPaths.some(path => pathname.startsWith(path))) {
    return null
  }

  // Render public pages directly
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return children
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <Toaster />
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile/Desktop sidebar overlay - Only show on mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Fixed Sidebar with better positioning */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-all duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } border-r border-gray-200 flex flex-col h-screen overflow-hidden`}
        >
          {/* Sidebar Header - Fixed (Remove X button) */}
          <div className="flex items-center justify-start h-16 px-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              {themeData?.logo ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                  <Image 
                    src={themeData.logo} 
                    alt="Website Logo" 
                    width={32} 
                    height={32} 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-admin-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
              )}
              <div>
                <span className="font-bold text-lg text-gray-900">Admin Panel</span>
                <div className="text-xs text-gray-500">{themeData?.siteName || "mnt Tours"}</div>
              </div>
            </div>
          </div>

          {/* Navigation - Fixed, Non-scrollable with exact spacing */}
          <nav className="flex-1 px-4 py-6 overflow-hidden flex flex-col">
            <div className="space-y-1 flex-1">
              {sidebarItems.map((item) => {
                if (item.isCollapsible) {
                  return (
                    <Collapsible key={item.name} open={pageManagerOpen} onOpenChange={setPageManagerOpen}>
                      <CollapsibleTrigger asChild>
                        <button
                          className={`flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 rounded-lg group ${
                            pageManagerOpen ? "bg-gray-50 text-gray-900" : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`${item.color} group-hover:scale-110 transition-transform duration-200`}>
                              {item.icon}
                            </div>
                            <span className="ml-3 font-medium">{item.name}</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              pageManagerOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1 overflow-hidden transition-all duration-200 ease-in-out">
                        {item.subItems?.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center px-4 py-2 ml-6 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 rounded-lg text-sm ${
                              pathname === subItem.href ? "bg-blue-50 text-admin-primary border-r-2 border-admin-primary" : ""
                            }`}
                            onClick={() => {
                              // Close sidebar on mobile when clicking nav item
                              if (window.innerWidth < 1024) {
                                setSidebarOpen(false)
                                localStorage.setItem('sidebarOpen', JSON.stringify(false))
                              }
                            }}
                          >
                            <div className="text-gray-500 mr-3">{subItem.icon}</div>
                            <span className="font-medium">{subItem.name}</span>
                            {pathname === subItem.href && (
                              <div className="ml-auto w-2 h-2 bg-admin-gradient rounded-full"></div>
                            )}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 rounded-lg group ${
                      pathname === item.href ? "bg-blue-50 text-admin-primary border-r-2 border-admin-primary" : ""
                    }`}
                    onClick={() => {
                      // Close sidebar on mobile when clicking nav item
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false)
                        localStorage.setItem('sidebarOpen', JSON.stringify(false))
                      }
                    }}
                  >
                    <div className={`${item.color} group-hover:scale-110 transition-transform duration-200`}>
                      {item.icon}
                    </div>
                    <span className="ml-3 font-medium">{item.name}</span>
                    {pathname === item.href && <div className="ml-auto w-2 h-2 bg-admin-gradient rounded-full"></div>}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Sidebar Footer - Fixed */}
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage src={adminProfile?.avatar || "/placeholder.svg"} alt="Admin avatar" />
                <AvatarFallback className="bg-admin-gradient text-white font-semibold text-sm">
                  {adminProfile ? `${adminProfile.firstName.charAt(0)}${adminProfile.lastName.charAt(0)}` : 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="font-semibold text-gray-900 text-sm">
                  {adminProfile ? `${adminProfile.firstName} ${adminProfile.lastName}` : 'Admin User'}
                </div>
                <div className="text-xs text-gray-500">{adminProfile?.role || 'Administrator'}</div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main content area with dynamic margin */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}>
          {/* Fixed Top bar */}
          <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
            <div className="flex items-center">
              {/* Universal Sidebar Toggle Button with Dynamic Icon */}
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 mr-4 flex items-center justify-center group"
                onClick={toggleSidebar}
                title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                ) : (
                  <PanelLeft className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                )}
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {pathname === "/admin"
                    ? "Dashboard"
                    : pathname === "/admin/packages"
                      ? "Packages"
                      : pathname === "/admin/tariff"
                        ? "Tariff"
                        : pathname === "/admin/banners"
                          ? "Banner Manager"
                          : pathname === "/admin/contact"
                            ? "Contact"
                            : pathname === "/admin/seo"
                              ? "SEO Manager"
                              : pathname === "/admin/testimonials"
                                ? "Testimonial Manager"
                                : pathname === "/admin/leads"
                                  ? "Lead Manager"
                                  : pathname === "/admin/locations"
                                    ? "Location Manager"
                                    : pathname === "/admin/theme"
                                      ? "Theme Settings"
                                      : pathname === "/admin/profile"
                                        ? "Profile Settings"
                                        : "Admin Panel"}
                </h1>
                <p className="text-sm text-gray-500">Manage your website content</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={adminProfile?.avatar || "/placeholder.svg"} alt="Admin avatar" />
                    <AvatarFallback className="bg-admin-gradient text-white text-sm font-semibold">
                      {adminProfile ? `${adminProfile.firstName.charAt(0)}${adminProfile.lastName.charAt(0)}` : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown 
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                    
                    
                    <div className="py-2">
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3 text-indigo-600" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Page content - Only this area scrolls */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Suspense>
  )
}