import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data in dependency order
  await prisma.message.deleteMany();
  await prisma.tripInterest.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  const [alice, bob, carol, dave] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: await hash('password123'),
        name: 'Alice Johnson',
        bio: 'Adventure-loving mom of two. Love hiking, beach trips, and cultural experiences.',
        familySize: 4,
        childrenAges: '8, 11',
        travelPreferences: 'adventure,nature,cultural',
        availability: 'summer,school-holidays',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        password: await hash('password123'),
        name: 'Bob Martinez',
        bio: 'Couple traveler. We love discovering local food and relaxing on beaches.',
        familySize: 2,
        childrenAges: null,
        travelPreferences: 'relaxation,cultural,urban',
        availability: 'year-round,weekends',
      },
    }),
    prisma.user.create({
      data: {
        email: 'carol@example.com',
        password: await hash('password123'),
        name: 'Carol Smith',
        bio: 'Solo traveler turned family adventurer. Three kids, endless energy!',
        familySize: 5,
        childrenAges: '5, 9, 13',
        travelPreferences: 'budget,adventure,nature',
        availability: 'summer,winter-holidays',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dave@example.com',
        password: await hash('password123'),
        name: 'Dave Chen',
        bio: 'Luxury travel enthusiast. Looking for like-minded couples for city breaks.',
        familySize: 2,
        childrenAges: null,
        travelPreferences: 'luxury,urban,cultural',
        availability: 'monthly-weekends,autumn',
      },
    }),
  ]);

  // Seed interests
  await prisma.interest.createMany({
    data: [
      { userId: alice.id, tag: 'hiking' },
      { userId: alice.id, tag: 'beaches' },
      { userId: alice.id, tag: 'museums' },
      { userId: bob.id, tag: 'food' },
      { userId: bob.id, tag: 'beaches' },
      { userId: carol.id, tag: 'camping' },
      { userId: carol.id, tag: 'national-parks' },
      { userId: dave.id, tag: 'fine-dining' },
      { userId: dave.id, tag: 'city-tours' },
    ],
  });

  const now = new Date();
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

  const trips = await Promise.all([
    prisma.trip.create({
      data: {
        title: 'Barcelona Family Summer Adventure',
        description:
          'Looking for a family to join us for two weeks in Barcelona. We plan to visit Sagrada Família, Park Güell, and spend plenty of time at the beach. Our kids (8 & 11) love water parks and good food. Happy to split costs on a large Airbnb.',
        destination: 'Barcelona, Spain',
        startDate: addDays(now, 45),
        endDate: addDays(now, 59),
        groupType: 'family',
        activityPref: 'beaches,cultural,water-parks',
        budget: 3000,
        createdById: alice.id,
      },
    }),
    prisma.trip.create({
      data: {
        title: 'Couples Weekend in Paris',
        description:
          'We are a couple looking for another couple to share a Parisian long weekend. Think Eiffel Tower at sunset, great bistros, and a day trip to Versailles. We prefer relaxed pace with good wine.',
        destination: 'Paris, France',
        startDate: addDays(now, 30),
        endDate: addDays(now, 33),
        groupType: 'couple',
        activityPref: 'cultural,food,relaxation',
        budget: 1500,
        createdById: bob.id,
      },
    }),
    prisma.trip.create({
      data: {
        title: 'Costa Rica Eco-Adventure with Kids',
        description:
          'Planning a 10-day eco-adventure in Costa Rica — zip-lining, cloud forests, and wildlife. We have three kids (5, 9, 13) and would love another big family to join. Renting a van and two cabins to keep costs down.',
        destination: 'Costa Rica',
        startDate: addDays(now, 90),
        endDate: addDays(now, 100),
        groupType: 'family',
        activityPref: 'adventure,nature,wildlife',
        budget: 4500,
        createdById: carol.id,
      },
    }),
    prisma.trip.create({
      data: {
        title: 'Tokyo Luxury City Break',
        description:
          'Looking for a couple to join us for a curated luxury Tokyo experience. We have restaurant reservations lined up, private tour of teamLab Planets, and a night at an onsen ryokan. World-class food guaranteed.',
        destination: 'Tokyo, Japan',
        startDate: addDays(now, 60),
        endDate: addDays(now, 67),
        groupType: 'couple',
        activityPref: 'luxury,cultural,food',
        budget: 6000,
        createdById: dave.id,
      },
    }),
    prisma.trip.create({
      data: {
        title: 'Scottish Highlands Hiking Group',
        description:
          'Organizing a week of hiking in the Scottish Highlands. Ben Nevis, Glencoe, Loch Ness. Looking for solo hikers or couples who want to share a highland cottage. All fitness levels welcome — we have easy and hard routes planned.',
        destination: 'Scottish Highlands, UK',
        startDate: addDays(now, 75),
        endDate: addDays(now, 82),
        groupType: 'group',
        activityPref: 'hiking,nature,adventure',
        budget: 900,
        createdById: alice.id,
      },
    }),
    prisma.trip.create({
      data: {
        title: 'Bali Family Retreat',
        description:
          'Two-week family trip to Bali. Rice terraces, temple tours, cooking classes, and beach days in Seminyak. Kids-friendly villa with pool already booked — looking for one more family to join and share the villa.',
        destination: 'Bali, Indonesia',
        startDate: addDays(now, 120),
        endDate: addDays(now, 134),
        groupType: 'family',
        activityPref: 'relaxation,cultural,beaches',
        budget: 3500,
        createdById: carol.id,
      },
    }),
    prisma.trip.create({
      data: {
        title: 'NYC Cultural Weekend',
        description:
          'Planning a packed NYC weekend: MoMA, Broadway show, food tour through Queens, and a bike ride in Central Park. Looking for a couple or small group to share the fun and split a midtown Airbnb.',
        destination: 'New York City, USA',
        startDate: addDays(now, 21),
        endDate: addDays(now, 24),
        groupType: 'couple',
        activityPref: 'urban,cultural,food',
        budget: 1200,
        createdById: dave.id,
      },
    }),
  ]);

  // A few trip interests
  await prisma.tripInterest.createMany({
    data: [
      { userId: bob.id, tripId: trips[0].id },   // Bob interested in Alice's Barcelona trip
      { userId: carol.id, tripId: trips[1].id },  // Carol interested in Bob's Paris trip
      { userId: alice.id, tripId: trips[2].id },  // Alice interested in Carol's Costa Rica trip
      { userId: dave.id, tripId: trips[4].id },   // Dave interested in Scottish Highlands
      { userId: bob.id, tripId: trips[3].id },    // Bob interested in Dave's Tokyo trip
    ],
  });

  // A sample message thread between Alice and Bob (about the Barcelona trip)
  await prisma.message.createMany({
    data: [
      {
        content: 'Hi Bob! Saw you expressed interest in our Barcelona trip. We would love to have you and your partner join us!',
        senderId: alice.id,
        receiverId: bob.id,
        tripId: trips[0].id,
      },
      {
        content: 'Thanks Alice! We are very excited about it. What accommodation are you thinking?',
        senderId: bob.id,
        receiverId: alice.id,
        tripId: trips[0].id,
      },
      {
        content: 'We were thinking a big Airbnb near Barceloneta beach — plenty of space for both families. Would that work for you two?',
        senderId: alice.id,
        receiverId: bob.id,
        tripId: trips[0].id,
      },
    ],
  });

  console.log(`Seeded: ${[alice, bob, carol, dave].length} users, ${trips.length} trips`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
