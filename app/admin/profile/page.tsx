"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { User, Mail } from 'lucide-react'
import ProfileInformation from "./components/profileInformation"
import EmailSMTP from "./components/EmailSMTP"
 
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", name: "Profile Information", icon: <User className="h-4 w-4" /> },
    { id: "security", name: "Email & SMTP", icon: <Mail className="h-4 w-4" /> }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-admin-gradient bg-clip-text text-transparent">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and email configuration</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="shadow-xl border-0 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-admin-primary text-admin-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <CardContent className="p-8">
          {activeTab === "profile" && <ProfileInformation />}
          {activeTab === "security" && <EmailSMTP />}
        </CardContent>
      </Card>
    </div>
  )
}