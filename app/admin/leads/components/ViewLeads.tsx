"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  Star,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  MapPin,
  Globe,
  Briefcase,
  Target,
  TrendingUp,
  Activity,
  Copy,
  ExternalLink,
  Edit,
  X,
  Car,
  Users,
  Navigation,
  DollarSign
} from "lucide-react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"

interface TravelLead {
  _id?: string;
  id: number;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  travelDate: string;
  travelTime?: string;
  returnDate?: string;
  pickupLocation: string;
  dropLocation: string;
  passengers: number;
  message: string;
  status: "new" | "contacted" | "confirmed" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  source: "website" | "whatsapp" | "phone" | "referral";
  submittedAt: string;
  lastUpdated: string;
  estimatedCost?: string;
  notes?: string;
  reviewLink?: string;
  reviewToken?: string;
}

interface ViewLeadsProps {
  lead: TravelLead | null
  isOpen: boolean
  onClose: () => void
}

export default function ViewLeads({ lead, isOpen, onClose }: ViewLeadsProps) {
  if (!lead) return null

  // Debug logging
  console.log('ViewLeads lead data:', {
    status: lead.status,
    reviewLink: lead.reviewLink,
    reviewToken: lead.reviewToken
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-4 w-4" />
      case "contacted":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusGradient = (status: string) => {
    switch (status) {
      case "new":
        return "from-blue-500 to-cyan-500"
      case "contacted":
        return "from-yellow-500 to-orange-500"
      case "confirmed":
        return "from-purple-500 to-pink-500"
      case "completed":
        return "from-green-500 to-emerald-500"
      case "cancelled":
        return "from-gray-500 to-slate-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case "high":
        return "from-red-500 to-rose-500"
      case "medium":
        return "from-orange-500 to-amber-500"
      case "low":
        return "from-green-500 to-teal-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

  const getSourceGradient = (source: string) => {
    switch (source) {
      case "website":
        return "from-blue-500 to-indigo-500"
      case "whatsapp":
        return "from-green-500 to-emerald-500"
      case "phone":
        return "from-purple-500 to-violet-500"
      case "referral":
        return "from-orange-500 to-red-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-slate-50 to-gray-100">
        <DialogHeader className="sr-only">
          <DialogTitle>Lead Details for {lead.fullName}</DialogTitle>
        </DialogHeader>
        {/* Header Section */}
        <div className="relative bg-admin-gradient p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{lead.fullName}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  {lead.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{lead.email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-white/20"
                        onClick={() => copyToClipboard(lead.email)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{lead.phone}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-white/20"
                      onClick={() => copyToClipboard(lead.phone)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-3 mt-6">
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getStatusGradient(lead.status)} text-white font-medium flex items-center gap-2 shadow-lg`}>
              {getStatusIcon(lead.status)}
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </div>
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getPriorityGradient(lead.priority)} text-white font-medium flex items-center gap-2 shadow-lg`}>
              <TrendingUp className="h-4 w-4" />
              {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
            </div>
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getSourceGradient(lead.source)} text-white font-medium flex items-center gap-2 shadow-lg`}>
              {lead.source === 'whatsapp' ? <WhatsAppIcon className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              {lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Left Column - Contact & Travel Info */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Customer Name</span>
                      <Button
                        variant="ghost"
                        size="sm" 
                        className="h-6 w-6 p-0" 
                        onClick={() => copyToClipboard(lead.fullName)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">{lead.fullName}</p>
                  </div>

                  {lead.email && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Email</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(lead.email)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(`mailto:${lead.email}`)}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="font-semibold text-blue-600 text-sm">{lead.email}</p>
                    </div>
                  )}

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Phone</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(lead.phone)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(`tel:${lead.phone}`)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">{lead.phone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Travel Details */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Car className="h-5 w-5 text-white" />
                    </div>
                    Travel Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Service Type</span>
                      <Target className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="font-semibold text-indigo-600 text-lg">{lead.serviceType}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Travel Date</span>
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">{new Date(lead.travelDate).toLocaleDateString()}</p>
                    {lead.travelTime && (
                      <p className="text-sm text-gray-600 mt-1">Time: {lead.travelTime}</p>
                    )}
                  </div>

                  {lead.returnDate && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Return Date</span>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-900 text-lg">{new Date(lead.returnDate).toLocaleDateString()}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Navigation className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-600">Pickup Location</span>
                      </div>
                      <p className="font-semibold text-gray-900">{lead.pickupLocation}</p>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-gray-600">Drop Location</span>
                      </div>
                      <p className="font-semibold text-gray-900">{lead.dropLocation}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">Passengers</span>
                      </div>
                      <p className="font-semibold text-gray-900">{lead.passengers}</p>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-600">Estimated Cost</span>
                      </div>
                      <p className="font-semibold text-gray-900">{lead.estimatedCost || "To be determined"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Messages & Timeline */}
            <div className="space-y-6">
              {/* Customer Message */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    Customer Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {lead.message || "No message provided."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Internal Notes */}
              {lead.notes && (
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      Internal Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {lead.notes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}



              {/* Review Link Info (for completed leads) */}
              {lead.status === "completed" && lead.reviewLink && (
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      Review Link
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Review URL</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(lead.reviewLink!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-mono text-xs text-gray-700 break-all">{lead.reviewLink}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-600">Submitted</span>
                    </div>
                    <p className="font-semibold text-gray-900">{formatDate(lead.submittedAt)}</p>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">Last Updated</span>
                    </div>
                    <p className="font-semibold text-gray-900">{formatDate(lead.lastUpdated)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {lead.email && (
                      <Button
                        className="h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium shadow-lg"
                        onClick={() => window.open(`mailto:${lead.email}`)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    )}
                    <Button
                      className="h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium shadow-lg"
                      onClick={() => window.open(`tel:${lead.phone}`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Customer
                    </Button>
                    <Button
                      className="h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-lg"
                      onClick={() => window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`)}
                    >
                      <WhatsAppIcon className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    
                    {/* Review Link for Completed Leads */}
                    {lead.status === "completed" && (
                      <>
                        {lead.reviewLink ? (
                          <Button
                            className="h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium shadow-lg"
                            onClick={() => {
                              const reviewMessage = `Hi ${lead.fullName}! Thank you for choosing mnt Tours & Travels. We hope you had a great experience with our ${lead.serviceType} service. 

Please take a moment to share your feedback by clicking here: ${lead.reviewLink}

If the link doesn't work, you can copy and paste this URL in your browser: ${lead.reviewLink}

Your feedback helps us serve you better! 🙏`;
                              window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(reviewMessage)}`);
                            }}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Share Review Link
                          </Button>
                        ) : (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              Review link will be generated automatically. Please refresh the page or close and reopen this modal to see the share button.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}