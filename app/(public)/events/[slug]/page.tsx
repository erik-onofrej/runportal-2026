import { eventService } from '@/lib/services/event.service';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Users, Clock, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await eventService.getEventBySlug(slug);

  if (!event) {
    return {
      title: 'Event Not Found',
    };
  }

  return {
    title: event.title,
    description: event.description || undefined,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await eventService.getEventBySlug(slug);

  if (!event || event.status !== 'published') {
    notFound();
  }

  const isRegistrationOpen =
    event.registrationOpenDate &&
    event.registrationCloseDate &&
    new Date() >= new Date(event.registrationOpenDate) &&
    new Date() <= new Date(event.registrationCloseDate);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      {event.coverImage && (
        <div className="aspect-[21/9] relative overflow-hidden rounded-lg mb-8">
          <img
            src={event.coverImage}
            alt={event.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                {(event as any).location?.city}, {(event as any).location?.district?.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Organizer</div>
              <div className="text-sm text-muted-foreground">
                {(event as any).organizer?.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Registration</div>
              <div className="text-sm">
                {isRegistrationOpen ? (
                  <Badge variant="default">Open</Badge>
                ) : (
                  <Badge variant="secondary">Closed</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {event.description && (
          <p className="text-muted-foreground whitespace-pre-wrap">
            {event.description}
          </p>
        )}
      </div>

      <Tabs defaultValue="races" className="space-y-6">
        <TabsList>
          <TabsTrigger value="races">Races & Registration</TabsTrigger>
          {(event as any).schedule && (event as any).schedule.length > 0 && (
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          )}
          {(event as any).attachments && (event as any).attachments.length > 0 && (
            <TabsTrigger value="attachments">Documents</TabsTrigger>
          )}
          {(event as any).partners && (event as any).partners.length > 0 && (
            <TabsTrigger value="partners">Partners</TabsTrigger>
          )}
        </TabsList>

        {/* Races & Registration Tab */}
        <TabsContent value="races" className="space-y-6">
          {(event as any).runs && (event as any).runs.length > 0 ? (
            (event as any).runs.map((run: any) => (
              <Card key={run.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{run.name}</CardTitle>
                      <CardDescription>
                        {run.distance}km
                        {run.elevationGain && ` • ${run.elevationGain}m elevation gain`}
                        {run.maxParticipants && ` • Max ${run.maxParticipants} participants`}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{run.distance}km</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {run.description && (
                    <p className="text-sm text-muted-foreground">{run.description}</p>
                  )}

                  {/* Categories */}
                  {run.categories && run.categories.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Categories</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {run.categories.map((category: any) => (
                          <div
                            key={category.id}
                            className="border rounded-lg p-3 text-sm"
                          >
                            <div className="font-medium">{category.name}</div>
                            {category.description && (
                              <div className="text-muted-foreground">
                                {category.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Entry Fees */}
                  {run.entryFees && run.entryFees.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Entry Fees</h4>
                      <div className="space-y-2">
                        {run.entryFees.map((fee: any) => {
                          const now = new Date();
                          const isActive =
                            now >= new Date(fee.validFrom) &&
                            now <= new Date(fee.validTo);

                          return (
                            <div
                              key={fee.id}
                              className="border rounded-lg p-3 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium">{fee.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Valid:{' '}
                                  {new Date(fee.validFrom).toLocaleDateString('sk-SK')}{' '}
                                  - {new Date(fee.validTo).toLocaleDateString('sk-SK')}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">
                                  {fee.amount} {fee.currency}
                                </div>
                                {isActive && (
                                  <Badge variant="default" className="mt-1">
                                    Current
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Registration Button */}
                  <div className="flex justify-end">
                    {isRegistrationOpen ? (
                      <Link
                        href={`/events/${event.slug}/register?runId=${run.id}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
                      >
                        Register for {run.name}
                      </Link>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Registration is currently closed
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No races available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        {(event as any).schedule && (event as any).schedule.length > 0 && (
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Event Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(event as any).schedule.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="font-medium min-w-[100px]">
                        {new Date(item.startTime).toLocaleTimeString('sk-SK', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                        {item.location && (
                          <div className="text-sm text-muted-foreground">
                            📍 {item.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Attachments Tab */}
        {(event as any).attachments && (event as any).attachments.length > 0 && (
          <TabsContent value="attachments">
            <Card>
              <CardHeader>
                <CardTitle>Documents & Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(event as any).attachments.map((attachment: any) => (
                    <a
                      key={attachment.id}
                      href={attachment.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{attachment.title}</div>
                        {attachment.description && (
                          <div className="text-sm text-muted-foreground">
                            {attachment.description}
                          </div>
                        )}
                      </div>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Partners Tab */}
        {(event as any).partners && (event as any).partners.length > 0 && (
          <TabsContent value="partners">
            <Card>
              <CardHeader>
                <CardTitle>Partners & Sponsors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {(event as any).partners.map((eventPartner: any) => (
                    <div
                      key={eventPartner.id}
                      className="flex flex-col items-center gap-3"
                    >
                      {eventPartner.partner.logoUrl && (
                        <img
                          src={eventPartner.partner.logoUrl}
                          alt={eventPartner.partner.name}
                          className="h-16 object-contain"
                        />
                      )}
                      <div className="text-center">
                        <div className="font-medium">
                          {eventPartner.partner.name}
                        </div>
                        {eventPartner.partnershipLevel && (
                          <Badge variant="outline" className="mt-1">
                            {eventPartner.partnershipLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Payment Information */}
      {event.bankAccount && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-sm font-medium">Bank Account</div>
              <div className="font-mono">{event.bankAccount}</div>
            </div>
            {event.paymentNote && (
              <div>
                <div className="text-sm font-medium">Payment Note</div>
                <div className="text-sm text-muted-foreground">
                  {event.paymentNote}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
