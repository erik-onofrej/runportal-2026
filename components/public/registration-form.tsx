'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from '@/lib/auth-client';
import {
  createRegistrationAction,
  getLastRegistrationByEmailAction,
  type RegistrationFormData,
} from '@/actions/registration.actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const registrationSchema = z.object({
  runId: z.number(),
  categoryId: z.number(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().refine((date) => {
    const dob = new Date(date);
    const age = (new Date().getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 5 && age <= 120;
  }, 'Invalid date of birth'),
  gender: z.enum(['male', 'female', 'other']),
  city: z.string().optional(),
  club: z.string().optional(),
});

interface RegistrationFormProps {
  runId: number;
  runName: string;
  eventSlug: string;
  categories: Array<{
    id: number;
    name: string;
    description: string | null;
  }>;
  currentEntryFee?: {
    amount: number;
    currency: string;
    name: string;
  } | null;
}

export function RegistrationForm({
  runId,
  runName,
  eventSlug,
  categories,
  currentEntryFee,
}: RegistrationFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrefill, setIsLoadingPrefill] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      runId,
      categoryId: categories[0]?.id || 0,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      city: '',
      club: '',
    },
  });

  // Pre-fill form from user's last registration
  useEffect(() => {
    async function loadLastRegistration() {
      if (!session?.user?.email) return;

      setIsLoadingPrefill(true);
      try {
        const result = await getLastRegistrationByEmailAction(session.user.email);

        if (result.success && result.registration) {
          const reg = result.registration;
          form.reset({
            runId,
            categoryId: categories[0]?.id || 0,
            firstName: reg.firstName,
            lastName: reg.lastName,
            email: reg.email,
            phone: reg.phone || '',
            dateOfBirth: new Date(reg.dateOfBirth).toISOString().split('T')[0],
            gender: reg.gender as 'male' | 'female' | 'other',
            city: reg.city || '',
            club: reg.club || '',
          });
        } else {
          // No previous registration, just set email from user account
          form.setValue('email', session.user.email);
        }
      } catch (err) {
        console.error('Failed to load last registration:', err);
        // Fallback to just setting email
        form.setValue('email', session.user.email);
      } finally {
        setIsLoadingPrefill(false);
      }
    }

    loadLastRegistration();
  }, [session, runId, categories, form]);

  async function onSubmit(data: RegistrationFormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createRegistrationAction(data);

      if (result.success && result.registrationNumber) {
        // Redirect to confirmation page
        router.push(
          `/events/${eventSlug}/confirmation?registrationNumber=${result.registrationNumber}`
        );
      } else {
        setError(result.error || 'Failed to create registration');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register for {runName}</CardTitle>
        <CardDescription>
          {isLoadingPrefill
            ? 'Loading your information...'
            : 'Fill in your details to register for this race. No account required.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Category Selection */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                          {category.description && ` - ${category.description}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      You will receive confirmation at this email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+421 900 123 456" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional contact number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Bratislava" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="club"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Running Club</FormLabel>
                    <FormControl>
                      <Input placeholder="Your club name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Entry Fee Display */}
            {currentEntryFee && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Current Entry Fee</div>
                    <div className="text-sm text-muted-foreground">
                      {currentEntryFee.name}
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {currentEntryFee.amount} {currentEntryFee.currency}
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By registering, you agree to the event terms and conditions.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
