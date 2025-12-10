import { eventService } from '@/lib/services/event.service';
import { registrationService } from '@/lib/services/registration.service';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Users, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ runId?: string }>;
}) {
  const { slug } = await params;
  const { runId } = await searchParams;
  const event = await eventService.getEventBySlug(slug);

  if (!event) {
    return {
      title: 'Event Not Found',
    };
  }

  return {
    title: `Participants - ${event.title}`,
    description: `View registered participants for ${event.title}`,
  };
}

export default async function ParticipantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ runId?: string }>;
}) {
  const { slug } = await params;
  const { runId } = await searchParams;

  const event = await eventService.getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  if (!runId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Run Selected</CardTitle>
            <CardDescription>
              Please select a run to view participants.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={`/events/${slug}`}
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to event
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const run = (event as any).runs?.find((r: any) => r.id === Number(runId));

  if (!run) {
    notFound();
  }

  const registrations = await registrationService.getRegistrationsByRun(Number(runId));

  // Group registrations by category
  const registrationsByCategory = registrations.reduce((acc: any, reg: any) => {
    const categoryName = reg.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(reg);
    return acc;
  }, {});

  // Calculate stats
  const totalParticipants = registrations.length;
  const paidCount = registrations.filter((r: any) => r.paid).length;
  const pendingCount = registrations.filter((r: any) => r.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/events/${slug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to event
        </Link>

        <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
        <h2 className="text-2xl font-semibold text-muted-foreground mb-4">{run.name}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Event Date</div>
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
              <div className="text-sm font-medium">Distance</div>
              <div className="text-sm text-muted-foreground">
                {run.distance}km
                {run.elevationGain && ` • ${run.elevationGain}m elevation`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Participants</div>
              <div className="text-sm text-muted-foreground">
                {totalParticipants} registered
                {run.maxParticipants && ` / ${run.maxParticipants} max`}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Registered</CardDescription>
              <CardTitle className="text-3xl">{totalParticipants}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Paid</CardDescription>
              <CardTitle className="text-3xl text-green-600">{paidCount}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Payment</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Participants List */}
      {totalParticipants === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No participants yet</p>
            <p className="text-muted-foreground">
              Be the first to register for this race!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(registrationsByCategory).map(([categoryName, categoryRegs]: [string, any]) => (
            <Card key={categoryName}>
              <CardHeader>
                <CardTitle>
                  {categoryName}
                  <Badge variant="secondary" className="ml-3">
                    {categoryRegs.length} {categoryRegs.length === 1 ? 'participant' : 'participants'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Year of Birth</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Club</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryRegs.map((registration: any, index: number) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {registration.firstName} {registration.lastName}
                        </TableCell>
                        <TableCell>
                          {new Date(registration.dateOfBirth).getFullYear()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {registration.city || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {registration.club || '-'}
                        </TableCell>
                        <TableCell>
                          {registration.paid ? (
                            <Badge variant="default" className="bg-green-600">
                              Paid
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {new Date(registration.registeredAt).toLocaleDateString('sk-SK')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
