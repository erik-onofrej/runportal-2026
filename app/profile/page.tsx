import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "./_components/profile-form"
import { SecurityForm } from "./_components/security-form"
import { SessionsList } from "./_components/sessions-list"
import { RunnerDashboard } from "@/components/profile/runner-dashboard"
import { getCurrentRunnerProfile, getRunnerRegistrations, getRunnerStats } from "@/actions/runner-profile.actions"

export default async function ProfilePage() {
  // Try to fetch runner profile data
  const runnerResult = await getCurrentRunnerProfile()
  const runner = runnerResult.success && runnerResult.data ? runnerResult.data : null

  // Fetch quick stats if runner exists
  let quickStats
  if (runner) {
    const [upcomingResult, pastResult, statsResult] = await Promise.all([
      getRunnerRegistrations({ status: 'upcoming' }),
      getRunnerRegistrations({ status: 'past' }),
      getRunnerStats(),
    ])

    const upcomingRaces = upcomingResult.success && upcomingResult.data ? upcomingResult.data.length : 0
    const completedRaces = pastResult.success && pastResult.data ? pastResult.data.length : 0
    const totalDistance = statsResult.success && statsResult.data ? statsResult.data.totalDistance : 0

    quickStats = {
      upcomingRaces,
      completedRaces,
      totalDistance,
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and runner profile
        </p>
      </div>

      <Tabs defaultValue={runner ? "runner" : "profile"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {runner && <TabsTrigger value="runner">Runner Profile</TabsTrigger>}
          <TabsTrigger value="profile">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {runner && (
          <TabsContent value="runner" className="space-y-4">
            <RunnerDashboard runner={runner} quickStats={quickStats} />
          </TabsContent>
        )}

        <TabsContent value="profile" className="space-y-4">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecurityForm />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <SessionsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
