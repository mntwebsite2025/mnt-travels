"use client"

import useSWR from "swr"

interface PackageData {
  _id: string
  title: string
  description: string
  image: string
  gallery?: string[]
  duration: string
  price: string
  featured: boolean
  highlights: string[]
  inclusions: string[]
  exclusions: string[]
  itinerary: Array<{
    day: number
    title: string
    description: string
  }>
  category: string
  slug: string
  isActive: boolean
}

export function usePackages() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: PackageData[] }>(
    '/api/packages',
    url => fetch(url).then(r => r.json()),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    },
  )

  return {
    packagesData: data?.data || [],
    isLoading,
    isError: error,
  }
}