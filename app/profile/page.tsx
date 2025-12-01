import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "./_components/profile-form"
import { SecurityForm } from "./_components/security-form"
import { SessionsList } from "./_components/sessions-list"

export default function ProfilePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

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
