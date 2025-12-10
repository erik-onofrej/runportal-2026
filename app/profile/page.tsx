import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "./_components/profile-form"
import { SecurityForm } from "./_components/security-form"
import { SessionsList } from "./_components/sessions-list"
import { RunnerDashboard } from "@/components/profile/runner-dashboard"
import { getUserProfileData, getUserRegistrations, getUserStats } from "@/actions/profile.actions"

export default async function ProfilePage() {
  // Try to fetch user profile data
  const profileResult = await getUserProfileData()
  const profile = profileResult.success && profileResult.data ? profileResult.data : null

  // Fetch quick stats if profile exists
  let quickStats
  if (profile) {
    const statsResult = await getUserStats()

    if (statsResult.success && statsResult.data) {
      quickStats = {
        upcomingRaces: statsResult.data.upcomingRaces,
        completedRaces: statsResult.data.completedRaces,
        totalDistance: statsResult.data.totalDistance,
      }
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

      <Tabs defaultValue={profile ? "runner" : "profile"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {profile && <TabsTrigger value="runner">Runner Profile</TabsTrigger>}
          <TabsTrigger value="profile">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {profile && (
          <TabsContent value="runner" className="space-y-4">
            <RunnerDashboard runner={profile} quickStats={quickStats} />
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
