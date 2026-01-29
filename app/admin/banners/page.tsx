"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Upload, Save, Loader2, ImageIcon } from "lucide-react"

export default function BannersPage() {
  const pageOptions = [
    { key: "home", label: "Home" },
    { key: "about", label: "About" },
    { key: "packages", label: "Packages" },
    { key: "tariff", label: "Tariff & Pricing" },
    { key: "contact", label: "Contact" },
  ]

  const [pageKey, setPageKey] = useState<string>("home")
  const [status, setStatus] = useState<string>("active")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const fetchBanner = async (key: string) => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/admin/banners/${encodeURIComponent(key)}`)
      if (res.data?.success && res.data.data) {
        const b = res.data.data as { image: string; status?: string }
        setImageUrl(b.image || "")
        setStatus(b.status || "active")
      } else {
        setImageUrl("")
        setStatus("active")
      }
    } catch (e) {
      setImageUrl("")
      setStatus("active")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanner(pageKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey])

  const onChooseImage = () => {
    fileInputRef.current?.click()
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f || null)
    if (f) {
      setImageUrl(URL.createObjectURL(f))
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem("admin_token")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again to continue.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const form = new FormData()
      form.append("pageKey", pageKey)
      form.append("status", status)
      if (imageUrl && !file) {
        form.append("existingImage", imageUrl)
      }
      if (file) {
        form.append("image", file)
      }

      const res = await axios.post(`/api/admin/banners`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      if (res.data?.success) {
        toast({ title: "Saved", description: "Banner saved successfully." })
        fetchBanner(pageKey)
        setFile(null)
      } else {
        toast({
          title: "Error",
          description: res.data?.message || "Failed to save banner",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || err?.message || "Failed to save banner",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-admin-gradient bg-clip-text text-transparent">Banner Manager</h1>
          <p className="text-gray-600 mt-1">Manage hero banners for each page</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Page</Label>
                <Select value={pageKey} onValueChange={(v) => setPageKey(v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select Page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageOptions.map((p) => (
                      <SelectItem key={p.key} value={p.key}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-semibold">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" onClick={onChooseImage} className="bg-admin-gradient text-white">
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Choose Image
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                <Button type="button" onClick={handleSave} disabled={loading} className="bg-admin-gradient text-white">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Banner
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Tip: If you don’t select a new image, the existing banner image will be kept.
              </p>
            </div>

            <div className="md:col-span-2">
              <Label className="font-semibold">Preview</Label>
              <div className="mt-2 relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 border">
                {imageUrl ? (
                  <>
                    <Image src={imageUrl || "/placeholder.svg"} alt={pageKey} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/30" />
                    {pageKey ? (
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-2">
                          {pageOptions.find((p) => p.key === pageKey)?.label}
                        </Badge>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    No image selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
