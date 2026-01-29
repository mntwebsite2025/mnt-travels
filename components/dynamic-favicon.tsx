"use client"

import { useEffect } from 'react'
import { useTheme } from '@/components/providers/theme'

export function DynamicFavicon() {
  const { themeData } = useTheme()

  useEffect(() => {
    if (typeof document !== 'undefined' && themeData?.favicon) {
      // Update existing favicon link or create new one
      let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      
      if (!faviconLink) {
        faviconLink = document.createElement('link')
        faviconLink.rel = 'icon'
        faviconLink.type = 'image/x-icon'
        document.head.appendChild(faviconLink)
      }
      
      faviconLink.href = themeData.favicon
      
      // Also update shortcut icon if exists
      let shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement
      if (!shortcutIcon) {
        shortcutIcon = document.createElement('link')
        shortcutIcon.rel = 'shortcut icon'
        shortcutIcon.type = 'image/x-icon'
        document.head.appendChild(shortcutIcon)
      }
      shortcutIcon.href = themeData.favicon

      // Update apple-touch-icon for mobile devices
      let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement('link')
        appleTouchIcon.rel = 'apple-touch-icon'
        document.head.appendChild(appleTouchIcon)
      }
      appleTouchIcon.href = themeData.favicon
    }
  }, [themeData?.favicon])

  // This component doesn't render anything visible
  return null
}