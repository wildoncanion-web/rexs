"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Save, Shield, Bell, Mail, Globe } from "lucide-react"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "INVESTMENT HOLDINGS, LLC",
    supportEmail: "support@investmentholdingsllc.org",
    maintenanceMode: false,
    emailNotifications: true,
    depositNotifications: true,
    withdrawalNotifications: true,
    minDeposit: "100",
    maxDeposit: "1000000",
    welcomeMessage: "Welcome to INVESTMENT HOLDINGS, LLC! Start your crypto investment journey with us today.",
  })

  const handleSave = () => {
    alert("Settings saved successfully!")
  }

  return (
    <div>
      <AdminHeader title="Settings" description="Configure platform settings and preferences" />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-emerald-500/20 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="h-5 w-5 text-emerald-500" />
                General Settings
              </CardTitle>
              <CardDescription className="text-zinc-500">Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Site Name</Label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Support Email</Label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Welcome Message</Label>
                <Textarea
                  value={settings.welcomeMessage}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-white"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="h-5 w-5 text-emerald-500" />
                Notification Settings
              </CardTitle>
              <CardDescription className="text-zinc-500">Configure admin notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Email Notifications</Label>
                  <p className="text-sm text-zinc-500">Receive email alerts</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(v) => setSettings({ ...settings, emailNotifications: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Deposit Alerts</Label>
                  <p className="text-sm text-zinc-500">Get notified on new deposits</p>
                </div>
                <Switch
                  checked={settings.depositNotifications}
                  onCheckedChange={(v) => setSettings({ ...settings, depositNotifications: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Withdrawal Alerts</Label>
                  <p className="text-sm text-zinc-500">Get notified on withdrawals</p>
                </div>
                <Switch
                  checked={settings.withdrawalNotifications}
                  onCheckedChange={(v) => setSettings({ ...settings, withdrawalNotifications: v })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-emerald-500" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-zinc-500">Platform security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Maintenance Mode</Label>
                  <p className="text-sm text-zinc-500">Disable user access temporarily</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Mail className="h-5 w-5 text-emerald-500" />
                Deposit Limits
              </CardTitle>
              <CardDescription className="text-zinc-500">Set minimum and maximum deposit amounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Minimum Deposit ($)</Label>
                <Input
                  type="number"
                  value={settings.minDeposit}
                  onChange={(e) => setSettings({ ...settings, minDeposit: e.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Maximum Deposit ($)</Label>
                <Input
                  type="number"
                  value={settings.maxDeposit}
                  onChange={(e) => setSettings({ ...settings, maxDeposit: e.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
