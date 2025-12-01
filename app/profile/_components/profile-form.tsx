"use client"

import { useState } from "react"
import { useSession } from "@/lib/auth-client"
import { updateProfile } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2 } from "lucide-react"

export function ProfileForm() {
  const { data: session, isPending } = useSession()
  const [name, setName] = useState("")
  const [image, setImage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize form when session loads
  useState(() => {
    if (session?.user) {
      setName(session.user.name || "")
      setImage(session.user.image || "")
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setIsLoading(true)

    try {
      const result = await updateProfile({
        name,
        image: image || undefined,
      })

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Profile updated!' })
        setHasChanges(false)
        // Reload session to show updated data
        window.location.reload()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameChange = (value: string) => {
    setName(value)
    setHasChanges(value !== (session?.user.name || ""))
  }

  const handleImageChange = (value: string) => {
    setImage(value)
    setHasChanges(true)
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!session) {
    return <div>Not authenticated</div>
  }

  const user = session.user

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile Information</h3>
        <p className="text-sm text-muted-foreground">
          Update your personal information and profile picture
        </p>
      </div>

      <Separator />

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Your name"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="flex items-center gap-2">
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <Badge variant="secondary">Read-only</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Email changes require verification and are not currently supported
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Profile Image URL</Label>
          <Input
            id="image"
            type="url"
            value={image}
            onChange={(e) => handleImageChange(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Paste a URL to your profile image
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex items-center h-10">
              <Badge variant="outline">{user.role}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Member Since</Label>
            <div className="flex items-center h-10">
              <span className="text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {hasChanges && (
            <p className="text-sm text-muted-foreground">
              You have unsaved changes
            </p>
          )}
        </div>
        <Button type="submit" disabled={isLoading || !hasChanges}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
