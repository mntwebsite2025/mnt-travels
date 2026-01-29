"use client"

import useSWR from "swr"

interface TariffService {
  _id: string
  vehicleType: string
  vehicleName: string
  description: string
  oneWayRate: string
  roundTripRate: string
  driverAllowance: string
  minimumKmOneWay: string
  minimumKmRoundTrip: string
  image: string
  featured: boolean
  additionalCharges: string[]
  slug: string
  isActive: boolean
}

export function useTariff() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: TariffService[] }>(
    '/api/tariff',
    url => fetch(url).then(r => r.json()),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    },
  )

  return {
    tariffData: data?.data || [],
    isLoading,
    isError: error,
  }
}