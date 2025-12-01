"use client"

import { useEffect, useState } from "react"
import { getUserSessions, revokeSession, revokeAllOtherSessions } from "../actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Monitor, Smartphone, Tablet, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type Session = {
  id: string
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  device: string
  ipAddress: string
  lastActive: Date
  createdAt: Date
  isCurrent: boolean
}

export function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [revokeAllDialogOpen, setRevokeAllDialogOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const loadSessions = async () => {
    setIsLoading(true)
    const result = await getUserSessions()
    if (result.success && result.sessions) {
      setSessions(result.sessions)
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to load sessions' })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleRevokeSession = async (sessionId: string) => {
    setMessage(null)
    const result = await revokeSession(sessionId)

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Session revoked' })
      loadSessions() // Reload sessions
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to revoke session' })
    }

    setRevokeDialogOpen(false)
    setSelectedSessionId(null)
  }

  const handleRevokeAll = async () => {
    setMessage(null)
    const result = await revokeAllOtherSessions()

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'All other sessions revoked' })
      loadSessions() // Reload sessions
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to revoke sessions' })
    }

    setRevokeAllDialogOpen(false)
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />
      case 'tablet':
        return <Tablet className="h-5 w-5" />
      default:
        return <Monitor className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const otherSessions = sessions.filter(s => !s.isCurrent)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Active Sessions</h3>
        <p className="text-sm text-muted-foreground">
          Manage your active sessions across different devices
        </p>
      </div>

      <Separator />

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No active sessions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`rounded-lg border p-4 ${session.isCurrent ? 'border-primary bg-primary/5' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-muted-foreground mt-1">
                    {getDeviceIcon(session.device)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {session.browser} {session.browserVersion && `${session.browserVersion}`}
                      </p>
                      {session.isCurrent && (
                        <Badge variant="default" className="text-xs">
                          Current Session
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {session.os} {session.osVersion && `${session.osVersion}`}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      IP: {session.ipAddress}
                    </p>

                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>
                        Last active: {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                      </span>
                      <span>•</span>
                      <span>
                        Created: {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSessionId(session.id)
                      setRevokeDialogOpen(true)
                    }}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}

          {otherSessions.length > 0 && (
            <div className="flex justify-end pt-4">
              <Button
                variant="destructive"
                onClick={() => setRevokeAllDialogOpen(true)}
              >
                Revoke All Other Sessions ({otherSessions.length})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Revoke Single Session Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out of this device. You'll need to sign in again to access your account from that device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedSessionId && handleRevokeSession(selectedSessionId)}
            >
              Revoke Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke All Sessions Dialog */}
      <AlertDialog open={revokeAllDialogOpen} onOpenChange={setRevokeAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke All Other Sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out of all other devices. You'll only remain signed in on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeAll}>
              Revoke All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
