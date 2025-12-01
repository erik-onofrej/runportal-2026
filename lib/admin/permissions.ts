import { Session } from "@/lib/auth"

export function canCreate(session: Session | null): boolean {
  if (!session) return false
  return session.user.role === "admin"
}

export function canUpdate(session: Session | null): boolean {
  if (!session) return false
  return session.user.role === "admin"
}

export function canDelete(session: Session | null): boolean {
  if (!session) return false
  return session.user.role === "admin"
}

export function canView(session: Session | null): boolean {
  if (!session) return false
  return session.user.role === "admin"
}
