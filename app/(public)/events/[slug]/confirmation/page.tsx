import { eventService } from '@/lib/services/event.service';
import { getRegistrationByNumberAction } from '@/actions/registration.actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Calendar, MapPin, User, Mail, Phone, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await eventService.getEventBySlug(slug);

  if (!event) {
    return {
      title: 'Registration Confirmation',
    };
  }

  return {
    title: `Confirmation - ${event.title}`,
    description: `Registration confirmation for ${event.title}`,
  };
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ registrationNumber?: string }>;
}) {
  const { slug } = await params;
  const { registrationNumber } = await searchParams;

  if (!registrationNumber) {
    notFound();
  }

  // Get registration details
  const registrationResult = await getRegistrationByNumberAction(registrationNumber);

  if (!registrationResult.success || !registrationResult.registration) {
    notFound();
  }

  const registration = registrationResult.registration;
  const event = registration.run.event;
  const run = registration.run;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Registration Successful!</h1>
        <p className="text-muted-foreground">
          Your registration has been received. Please check your email for confirmation.
        </p>
      </div>

      {/* Registration Number */}
      <Card className="mb-6 border-2 border-primary">
        <CardHeader className="text-center">
          <CardTitle>Your Registration Number</CardTitle>
          <CardDescription>
            Save this number for your records. You will need it for event check-in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold font-mono tracking-wider">
              {registration.registrationNumber}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(event.startDate).toLocaleDateString('sk-SK', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {event.location.city}, {event.location.district?.name}
              </div>
              {event.location.address && (
                <div className="text-sm text-muted-foreground">
                  {event.location.address}
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="font-medium mb-2">Race</div>
            <div className="flex items-center gap-2">
              <span>{run.name}</span>
              <Badge variant="outline">{run.distance}km</Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Category: {registration.category.name}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {registration.guestFirstName} {registration.guestLastName}
              </div>
              <div className="text-sm text-muted-foreground">
                Born: {new Date(registration.guestDateOfBirth).toLocaleDateString('sk-SK')}
                {' • '}
                {registration.guestGender}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">{registration.guestEmail}</div>
          </div>

          {registration.guestPhone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm">{registration.guestPhone}</div>
            </div>
          )}

          {(registration.guestCity || registration.guestClub) && (
            <div className="border-t pt-3 text-sm">
              {registration.guestCity && (
                <div>
                  <span className="font-medium">City:</span> {registration.guestCity}
                </div>
              )}
              {registration.guestClub && (
                <div>
                  <span className="font-medium">Club:</span> {registration.guestClub}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Information */}
      {event.paymentBankAccount && (
        <Card className="mb-6 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Payment Required</CardTitle>
            </div>
            <CardDescription>
              To complete your registration, please make the payment using the details below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {registration.paidAmount && (
              <div className="text-center py-4 border-y">
                <div className="text-sm text-muted-foreground mb-1">Amount to Pay</div>
                <div className="text-3xl font-bold">
                  {registration.paidAmount} EUR
                </div>
              </div>
            )}

            <div className="space-y-3">
              {event.paymentBankAccount && (
                <div>
                  <div className="text-sm font-medium">Bank Account</div>
                  <div className="font-mono text-sm bg-white dark:bg-gray-900 p-2 rounded border">
                    {event.paymentBankAccount}
                  </div>
                </div>
              )}

              {event.paymentIBAN && (
                <div>
                  <div className="text-sm font-medium">IBAN</div>
                  <div className="font-mono text-sm bg-white dark:bg-gray-900 p-2 rounded border">
                    {event.paymentIBAN}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium">Variable Symbol / Reference</div>
                <div className="font-mono text-sm bg-white dark:bg-gray-900 p-2 rounded border">
                  {event.paymentVariableSymbol || registration.registrationNumber}
                </div>
              </div>

              {event.paymentNote && (
                <div className="text-sm text-muted-foreground pt-2">
                  <strong>Note:</strong> {event.paymentNote}
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground pt-2 border-t">
              <strong>Important:</strong> Please use your registration number (
              <span className="font-mono">{registration.registrationNumber}</span>) as the
              payment reference to help us identify your payment.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check your email for confirmation (sent to {registration.guestEmail})</li>
            {event.paymentBankAccount && (
              <li>Make the payment using the banking details above</li>
            )}
            <li>Save your registration number: {registration.registrationNumber}</li>
            <li>Bring your registration number to the event check-in</li>
            {registration.bibNumber && (
              <li>Your bib number: {registration.bibNumber}</li>
            )}
          </ol>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline">
          <Link href={`/events/${slug}`}>Back to Event</Link>
        </Button>
        <Button asChild>
          <Link href="/events">Browse More Events</Link>
        </Button>
      </div>

      {/* Print Tip */}
      <div className="text-center text-sm text-muted-foreground mt-6">
        Tip: Print this page or take a screenshot for your records
      </div>
    </div>
  );
}
