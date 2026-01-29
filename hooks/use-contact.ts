"use client"

import useSWR from "swr"

interface ContactInfo {
  primaryPhone: string
  secondaryPhone?: string
  whatsappNumber: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  businessHours?: string
  bookingHours?: string
  servicesOffered?: string
  coverageAreas?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  instagram?: string
  youtube?: string
  whatsapp?: string
  telegram?: string
  mapEmbedCode?: string
  latitude?: string
  longitude?: string
  pageTitle: string
  pageDescription: string
  officeTitle: string
  officeDescription: string
}

export function useContact() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: ContactInfo }>(
    '/api/contact',
    url => fetch(url).then(r => r.json()),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    },
  )

  return {
    contactInfo: data?.data,
    isLoading,
    isError: error,
  }
}