import { eventService } from '@/lib/services/event.service';
import { registrationService } from '@/lib/services/registration.service';
import { notFound, redirect } from 'next/navigation';
import { RegistrationForm } from '@/components/public/registration-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await eventService.getEventBySlug(slug);

  if (!event) {
    return {
      title: 'Registration',
    };
  }

  return {
    title: `Register - ${event.title}`,
    description: `Register for ${event.title}`,
  };
}

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ runId?: string }>;
}) {
  const { slug } = await params;
  const { runId: runIdParam } = await searchParams;

  const event = await eventService.getEventBySlug(slug);

  if (!event || event.status !== 'published') {
    notFound();
  }

  // Check if registration is open
  const isRegistrationOpen =
    event.registrationOpenDate &&
    event.registrationCloseDate &&
    new Date() >= new Date(event.registrationOpenDate) &&
    new Date() <= new Date(event.registrationCloseDate);

  if (!isRegistrationOpen) {
    redirect(`/events/${slug}`);
  }

  // Get the run ID from search params
  const runId = runIdParam ? Number(runIdParam) : null;

  if (!runId) {
    redirect(`/events/${slug}`);
  }

  // Find the specific run
  const run = (event as any).runs?.find((r: any) => r.id === runId);

  if (!run) {
    notFound();
  }

  // Get current entry fee
  const currentEntryFee = await registrationService.getActiveEntryFee(
    runId,
    new Date()
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Event Summary */}
      <div className="mb-8">
        <Link
          href={`/events/${slug}`}
          className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
        >
          ← Back to event
        </Link>
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Date</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(event.startDate).toLocaleDateString('sk-SK', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Location</div>
                <div className="text-sm text-muted-foreground">
                  {(event as any).location.city}, {(event as any).location.district?.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Race</div>
                <div className="text-sm text-muted-foreground">
                  {run.name} - {run.distance}km
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Form */}
      <RegistrationForm
        runId={run.id}
        runName={run.name}
        eventSlug={slug}
        categories={run.categories || []}
        currentEntryFee={currentEntryFee}
      />

      {/* Payment Information */}
      {event.bankAccount && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>
              After registration, please make the payment to complete your registration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {event.bankAccount && (
              <div>
                <div className="text-sm font-medium">Bank Account</div>
                <div className="font-mono text-sm">{event.bankAccount}</div>
              </div>
            )}
            <div className="text-sm text-muted-foreground pt-2">
              Use your registration number as the payment reference.
              {event.paymentNote && ` ${event.paymentNote}`}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
