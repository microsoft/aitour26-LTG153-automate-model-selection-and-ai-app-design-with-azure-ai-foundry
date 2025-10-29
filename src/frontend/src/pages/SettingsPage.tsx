import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from '@phosphor-icons/react'

export default function SettingsPage() {
  const [offlineMode, setOfflineMode] = useState(false)

  // Load offline mode setting from sessionStorage on component mount
  useEffect(() => {
    const savedOfflineMode = sessionStorage.getItem('offlineMode')
    if (savedOfflineMode !== null) {
      setOfflineMode(savedOfflineMode === 'true')
    }
  }, [])

  // Save offline mode setting to sessionStorage whenever it changes
  const handleOfflineModeChange = (checked: boolean) => {
    setOfflineMode(checked)
    sessionStorage.setItem('offlineMode', String(checked))
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your application preferences and demo settings
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Demo Mode</CardTitle>
            <CardDescription>
              Configure how the application runs for demonstrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="offline-mode" className="text-base font-medium">
                  Offline Mode (Replay)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable replay mode to run the app without a backend or API keys
                </p>
              </div>
              <Switch
                id="offline-mode"
                checked={offlineMode}
                onCheckedChange={handleOfflineModeChange}
              />
            </div>

            {offlineMode && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Offline Mode Enabled</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      The app is now running in replay mode, which means:
                    </p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>No backend server or API keys are required</li>
                      <li>Responses, latencies, and costs are replayed from previous runs</li>
                      <li>Perfect for demos, presentations, and testing the UI</li>
                      <li>Simulates realistic timing and streaming behavior</li>
                    </ul>
                    <p className="mt-2 font-medium">
                      This simplifies setup and reduces risks when showcasing the demo.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {!offlineMode && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Live Mode Active</strong>
                  <div className="mt-2 text-sm">
                    <p>
                      The app is connecting to the backend server and making real API calls.
                      Ensure your backend is running and API keys are configured.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
