import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-lg text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            You don't have permission to access this resource. Please contact an administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sign-in">Sign in with a different account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
