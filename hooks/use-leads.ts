"use client"

import useSWR from "swr"

interface Lead {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  travelDate: string;
  pickupLocation: string;
  dropLocation: string;
  passengers: number;
  message: string;
  status: "new" | "contacted" | "confirmed" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  source: "website" | "whatsapp" | "phone" | "referral";
  estimatedCost: string;
  notes: string;
  submittedAt: string;
  lastUpdated: string;
}

export function useLeads() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Lead[] }>(
    '/api/admin/leads',
    url => fetch(url).then(r => r.json()),
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 60000, // Cache for 1 minute
    },
  )

  return {
    leads: data?.data || [],
    isLoading,
    isError: error,
    mutate, // For manual revalidation
  }
}