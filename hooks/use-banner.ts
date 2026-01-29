"use client"

import useSWR from "swr"

interface Banner {
  image: string
  title?: string
  status: string
}

export function useBanner(pageKey: string) {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: Banner }>(
    `/api/banners?pageKey=${pageKey}`,
    url => fetch(url).then(r => r.json()),
    {
      revalidateOnFocus: false, // Prevent revalidation on window focus
      revalidateIfStale: false, // Prevent revalidation if data is stale
      dedupingInterval: 60000, // Cache data for 1 minute
    },
  )

  return {
    banner: data?.data,
    isLoading,
    isError: error,
  }
}
