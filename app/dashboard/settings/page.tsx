"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
    company_name: "",
    address: "",
  })
  const [systemSettings, setSystemSettings] = useState({
    currency: "USD",
    tax_rate: "0",
    low_stock_threshold: "10",
    auto_reorder: false,
    email_notifications: true,
    receipt_footer: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        // Load profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || "",
            email: user.email || "",
            phone: profileData.phone || "",
            role: profileData.role || "",
            company_name: profileData.company_name || "",
            address: profileData.address || "",
          })
        }

        // Load system settings (you could store these in a settings table)
        const { data: settingsData } = await supabase
          .from("system_settings")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (settingsData) {
          setSystemSettings({
            currency: settingsData.currency || "USD",
            tax_rate: settingsData.tax_rate?.toString() || "0",
            low_stock_threshold: settingsData.low_stock_threshold?.toString() || "10",
            auto_reorder: settingsData.auto_reorder || false,
            email_notifications: settingsData.email_notifications || true,
            receipt_footer: settingsData.receipt_footer || "",
          })
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const updateProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        company_name: profile.company_name,
        address: profile.address,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSystemSettings = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from("system_settings").upsert({
        user_id: user.id,
        currency: systemSettings.currency,
        tax_rate: Number.parseFloat(systemSettings.tax_rate),
        low_stock_threshold: Number.parseInt(systemSettings.low_stock_threshold),
        auto_reorder: systemSettings.auto_reorder,
        email_notifications: systemSettings.email_notifications,
        receipt_footer: systemSettings.receipt_footer,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Settings Updated",
        description: "Your system settings have been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal and business information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500">Email cannot be changed from here</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                placeholder="Enter your company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Enter your business address"
                rows={3}
              />
            </div>

            <Button onClick={updateProfile} disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure your business preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={systemSettings.currency}
                onValueChange={(value) => setSystemSettings({ ...systemSettings, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                value={systemSettings.tax_rate}
                onChange={(e) => setSystemSettings({ ...systemSettings, tax_rate: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStock">Low Stock Threshold</Label>
              <Input
                id="lowStock"
                type="number"
                value={systemSettings.low_stock_threshold}
                onChange={(e) => setSystemSettings({ ...systemSettings, low_stock_threshold: e.target.value })}
                placeholder="10"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Reorder</Label>
                <p className="text-sm text-gray-500">Automatically create purchase orders for low stock items</p>
              </div>
              <Switch
                checked={systemSettings.auto_reorder}
                onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, auto_reorder: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive email alerts for important events</p>
              </div>
              <Switch
                checked={systemSettings.email_notifications}
                onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, email_notifications: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptFooter">Receipt Footer</Label>
              <Textarea
                id="receiptFooter"
                value={systemSettings.receipt_footer}
                onChange={(e) => setSystemSettings({ ...systemSettings, receipt_footer: e.target.value })}
                placeholder="Thank you for your business!"
                rows={2}
              />
            </div>

            <Button onClick={updateSystemSettings} disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage your business data and backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              <span className="text-sm font-medium">Export Data</span>
              <span className="text-xs text-gray-500 text-center">Download all your business data</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span className="text-sm font-medium">Backup Data</span>
              <span className="text-xs text-gray-500 text-center">Create a backup of your data</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm font-medium">System Health</span>
              <span className="text-xs text-gray-500 text-center">Check system performance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
