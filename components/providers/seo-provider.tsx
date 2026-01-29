"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface SEOData {
  id: string
  pageName: string
  title: string
  description: string
  keywords: string
  lastUpdated: string
}

interface SEOContextType {
  seoData: SEOData[]
  getSEOByPageId: (pageId: string) => SEOData | null
  loading: boolean
  error: string | null
  refreshSEOData: () => Promise<void>
}

const defaultContext: SEOContextType = {
  seoData: [],
  getSEOByPageId: () => null,
  loading: true,
  error: null,
  refreshSEOData: async () => {}
}

const SEOContext = createContext<SEOContextType>(defaultContext)

export function SEOProvider({ children }: { children: React.ReactNode }) {
  const [seoData, setSeoData] = useState<SEOData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSEOData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/seo')
      const data = await response.json()
      
      if (data.success) {
        setSeoData(data.data)
      } else {
        setError(data.message || 'Failed to fetch SEO data')
      }
    } catch (err) {
      setError('Failed to fetch SEO data')
      console.error('SEO fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSEOByPageId = (pageId: string): SEOData | null => {
    return seoData.find(item => item.id === pageId) || null
  }

  const refreshSEOData = async () => {
    await fetchSEOData()
  }

  useEffect(() => {
    fetchSEOData()
  }, [])

  const value: SEOContextType = {
    seoData,
    getSEOByPageId,
    loading,
    error,
    refreshSEOData
  }

  return (
    <SEOContext.Provider value={value}>
      {children}
    </SEOContext.Provider>
  )
}

export function useSEO() {
  const context = useContext(SEOContext)
  return context
}