"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeData {
  id: string
  siteName: string
  logo: string | null
  favicon: string | null
  primaryColor: string
  secondaryColor: string
  gradientDirection: string
  isActive: boolean
  lastUpdated: string
}

interface ThemeContextType {
  themeData: ThemeData | null
  loading: boolean
  error: string | null
  refreshTheme: () => Promise<void>
  updateThemeColors: (primaryColor: string, secondaryColor: string) => void
  updateFavicon: (faviconPath: string | null) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeData, setThemeData] = useState<ThemeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchThemeData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/theme')
      const data = await response.json()
      
      if (data.success) {
        setThemeData(data.data)
        updateCSSVariables(data.data.primaryColor, data.data.secondaryColor)
        updateFavicon(data.data.favicon)
      } else {
        setError(data.message || 'Failed to fetch theme data')
      }
    } catch (err) {
      setError('Failed to fetch theme data')
      console.error('Theme fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateCSSVariables = (primaryColor: string, secondaryColor: string) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      
      // Convert hex to HSL for CSS custom properties
      const hexToHsl = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255
        const g = parseInt(hex.slice(3, 5), 16) / 255
        const b = parseInt(hex.slice(5, 7), 16) / 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        let h = 0, s = 0, l = (max + min) / 2

        if (max !== min) {
          const d = max - min
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
          }
          h /= 6
        }

        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
      }

      // Set admin theme variables
      root.style.setProperty('--admin-primary', primaryColor)
      root.style.setProperty('--admin-secondary', secondaryColor)
      root.style.setProperty('--admin-gradient', `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`)
      
      // Set HSL versions for shadcn/ui compatibility
      root.style.setProperty('--admin-primary-hsl', hexToHsl(primaryColor))
      root.style.setProperty('--admin-secondary-hsl', hexToHsl(secondaryColor))
    }
  }

  const updateFavicon = (faviconPath: string | null) => {
    if (typeof document !== 'undefined' && faviconPath) {
      // Update existing favicon link or create new one
      let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      
      if (!faviconLink) {
        faviconLink = document.createElement('link')
        faviconLink.rel = 'icon'
        document.head.appendChild(faviconLink)
      }
      
      faviconLink.href = faviconPath
      
      // Also update shortcut icon if exists
      const shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement
      if (shortcutIcon) {
        shortcutIcon.href = faviconPath
      }
    }
  }

  const updateThemeColors = (primaryColor: string, secondaryColor: string) => {
    updateCSSVariables(primaryColor, secondaryColor)
    if (themeData) {
      setThemeData({
        ...themeData,
        primaryColor,
        secondaryColor
      })
    }
  }

  const refreshTheme = async () => {
    await fetchThemeData()
  }

  useEffect(() => {
    fetchThemeData()
  }, [])

  const value: ThemeContextType = {
    themeData,
    loading,
    error,
    refreshTheme,
    updateThemeColors,
    updateFavicon
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}