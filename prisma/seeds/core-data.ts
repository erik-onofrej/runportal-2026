import prisma from '../../lib/prisma';
import { auth } from '../../lib/auth';

async function seedCoreData() {
  console.log('Starting core data seed...');

  // Clear existing data
  console.log('Clearing existing core data...');
  await prisma.blogCategory.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.category.deleteMany();
  await prisma.contactSubmission.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user using Better Auth
  console.log('Creating users...');

  // Create admin user
  const adminResult = await auth.api.signUpEmail({
    body: {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
    },
  });

  if (adminResult && adminResult.user) {
    // Update user to be admin
    const admin = await prisma.user.update({
      where: { id: adminResult.user.id },
      data: {
        role: 'admin',
        emailVerified: true,
      },
    });
    console.log('  ✓ Created admin user (email: admin@example.com, password: admin123)');

    // Create regular user
    const userResult = await auth.api.signUpEmail({
      body: {
        email: 'user@example.com',
        password: 'user12345',
        name: 'John Doe',
      },
    });

    let user;
    if (userResult && userResult.user) {
      user = await prisma.user.update({
        where: { id: userResult.user.id },
        data: {
          emailVerified: true,
        },
      });
      console.log('  ✓ Created regular user (email: user@example.com, password: user12345)');
    } else {
      throw new Error('Failed to create regular user');
    }

  // Create blog categories
  console.log('Creating blog categories...');
  const techCategory = await prisma.category.create({
    data: {
      name: 'Technology',
      description: 'Technology and web development posts',
      color: '#3B82F6',
      sortOrder: 1,
      isVisible: true,
    },
  });

  const runningCategory = await prisma.category.create({
    data: {
      name: 'Running',
      description: 'Running tips, training, and fitness',
      color: '#10B981',
      sortOrder: 2,
      isVisible: true,
    },
  });

  const eventsCategory = await prisma.category.create({
    data: {
      name: 'Events',
      description: 'Upcoming events and announcements',
      color: '#F59E0B',
      sortOrder: 3,
      isVisible: true,
    },
  });

  const tipsCategory = await prisma.category.create({
    data: {
      name: 'Tips & Tricks',
      description: 'Helpful tips and advice',
      color: '#8B5CF6',
      sortOrder: 4,
      isVisible: true,
    },
  });
  console.log('  ✓ Created 4 blog categories');

  // Create blog posts
  console.log('Creating blog posts...');

  const blog1 = await prisma.blog.create({
    data: {
      title: 'Getting Started with Running: A Beginner\'s Guide',
      slug: 'getting-started-with-running',
      content: `# Getting Started with Running

Running is one of the most accessible forms of exercise. Whether you're looking to improve your fitness, lose weight, or train for your first race, this guide will help you get started on the right foot.

## Benefits of Running

- Improves cardiovascular health
- Helps with weight management
- Reduces stress and anxiety
- Builds strong bones and muscles
- Boosts mental health

## Tips for Beginners

1. **Start Slowly**: Don't try to run too far or too fast at first
2. **Get Proper Shoes**: Invest in good running shoes
3. **Warm Up**: Always start with a 5-minute walk
4. **Listen to Your Body**: Rest when you need to
5. **Stay Consistent**: Aim for 3-4 runs per week

## Sample Beginner Plan

- Week 1-2: Walk 2 minutes, run 1 minute (repeat 10 times)
- Week 3-4: Walk 1 minute, run 2 minutes (repeat 10 times)
- Week 5-6: Walk 1 minute, run 3 minutes (repeat 8 times)
- Week 7-8: Run 20 minutes continuously

Remember, everyone progresses at their own pace. The key is to stay consistent and enjoy the journey!`,
      status: 'published',
      views: 245,
      publishedAt: new Date('2024-11-15'),
      authorId: admin.id,
      categories: {
        create: [
          { categoryId: runningCategory.id },
          { categoryId: tipsCategory.id },
        ],
      },
    },
  });

  const blog2 = await prisma.blog.create({
    data: {
      title: 'Top 10 Running Events in Slovakia 2025',
      slug: 'top-10-running-events-slovakia-2025',
      content: `# Top 10 Running Events in Slovakia 2025

Slovakia offers some amazing running events throughout the year. From marathons to trail runs, there's something for every runner. Here are our top picks for 2025!

## 1. Bratislava Spring Marathon

The flagship marathon event in Slovakia's capital. Fast, flat course perfect for PRs.

## 2. Košice Peace Marathon

The oldest marathon in Europe! A must-do for serious marathon runners.

## 3. Devín-Bratislava Run

Historic run from Devín Castle to Bratislava city center.

## 4. Tatranský beh slobody

High Tatras mountain run with stunning views.

## 5. Račianska 10-ka

Popular 10K race through Bratislava's parks.

## More Events Coming Soon!

Check back for more event announcements and registration information.`,
      status: 'published',
      views: 432,
      publishedAt: new Date('2024-12-01'),
      authorId: admin.id,
      categories: {
        create: [
          { categoryId: runningCategory.id },
          { categoryId: eventsCategory.id },
        ],
      },
    },
  });

  const blog3 = await prisma.blog.create({
    data: {
      title: 'Building a Running Event Website with Next.js',
      slug: 'building-running-event-website-nextjs',
      content: `# Building a Running Event Website with Next.js

In this post, I'll share my experience building a comprehensive running event management platform using Next.js 16, TypeScript, and Prisma.

## Tech Stack

- **Next.js 16**: React framework with app router
- **TypeScript**: Type-safe development
- **Prisma**: ORM for PostgreSQL
- **Better Auth**: Modern authentication
- **Tailwind CSS v4**: Styling

## Key Features

### Event Management
- Create and manage running events
- Multiple runs per event (marathon, half, 10K, etc.)
- Category management for different age groups
- Dynamic pricing based on registration dates

### Registration System
- Guest-friendly registration (no account required)
- Optional runner profiles for returning participants
- Payment tracking
- Bib number assignment

### Results Management
- Import race results
- Calculate placements (overall and by category)
- Display results with filtering and search

## Lessons Learned

Building this platform taught me a lot about handling complex data relationships, optimizing database queries, and creating user-friendly interfaces.

Stay tuned for more technical deep-dives!`,
      status: 'published',
      views: 178,
      publishedAt: new Date('2024-12-05'),
      authorId: user.id,
      categories: {
        create: [
          { categoryId: techCategory.id },
        ],
      },
    },
  });

  const blog4 = await prisma.blog.create({
    data: {
      title: 'Training for Your First Half Marathon',
      slug: 'training-first-half-marathon',
      content: `# Training for Your First Half Marathon

Ready to take on the challenge of 21.1 kilometers? Here's everything you need to know to prepare for your first half marathon.

## 12-Week Training Plan Overview

A typical half marathon training plan runs for 12 weeks and gradually builds your endurance.

### Weeks 1-4: Base Building
Focus on building a solid running base with consistent easy runs.

### Weeks 5-8: Building Distance
Gradually increase your long run distance each week.

### Weeks 9-11: Peak Training
This is where you'll run your longest distances.

### Week 12: Taper
Reduce mileage to arrive fresh on race day.

## Essential Tips

- **Cross-training**: Include strength training and cycling
- **Rest days**: Just as important as running days
- **Nutrition**: Fuel your training properly
- **Hydration**: Drink plenty of water
- **Sleep**: Aim for 7-9 hours per night

## Race Day Preparation

- Don't try anything new on race day
- Eat familiar foods
- Start conservatively
- Have fun!

Good luck with your training!`,
      status: 'draft',
      views: 0,
      authorId: admin.id,
      categories: {
        create: [
          { categoryId: runningCategory.id },
          { categoryId: tipsCategory.id },
        ],
      },
    },
  });

  console.log('  ✓ Created 4 blog posts (3 published, 1 draft)');

  // Create contact submissions
  console.log('Creating contact submissions...');

  await prisma.contactSubmission.create({
    data: {
      name: 'Peter Novák',
      email: 'peter.novak@example.sk',
      subject: 'Question about event registration',
      message: 'Hi, I would like to know if group registrations are possible for the spring marathon. We have a running club with 15 members interested in participating. Is there a group discount available?',
      status: 'new',
    },
  });

  await prisma.contactSubmission.create({
    data: {
      name: 'Eva Tóthová',
      email: 'eva.toth@example.sk',
      subject: 'Sponsorship inquiry',
      message: 'Hello, our company is interested in becoming a sponsor for upcoming running events. Could you please send us information about sponsorship packages?',
      status: 'new',
    },
  });

  await prisma.contactSubmission.create({
    data: {
      name: 'Marek Szabó',
      email: 'marek.szabo@example.sk',
      subject: 'Results question',
      message: 'I participated in the autumn 10K race but cannot find my results online. My bib number was 234. Can you help me locate my results?',
      status: 'read',
    },
  });

    console.log('  ✓ Created 3 contact submissions');

    console.log('Core data seed completed!');
    console.log('Summary:');
    console.log('  - 2 users (admin & regular user)');
    console.log('  - 4 blog categories');
    console.log('  - 4 blog posts (3 published, 1 draft)');
    console.log('  - 3 contact submissions');
  } else {
    throw new Error('Failed to create admin user');
  }
}

export default seedCoreData;

// Run directly if this file is executed
if (require.main === module) {
  seedCoreData()
    .catch((e) => {
      console.error('Error seeding core data:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
