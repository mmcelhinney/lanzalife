import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Activity } from "./entity/Activity";
import { Place } from "./entity/Place";
import { Event } from "./entity/Event";

async function seed() {
  await AppDataSource.initialize();
  console.log("Data Source initialized!");

  // Clear existing data
  await AppDataSource.getRepository(Event).clear();
  await AppDataSource.getRepository(Activity).clear();
  await AppDataSource.getRepository(Place).clear();
  console.log("Existing data cleared.");

  // Create Activities
  const activitiesData = [
    { name: "Bingo" },
    { name: "Quiz Night" },
    { name: "Live Music" },
    { name: "Breakfast" },
    { name: "Lunch" },
    { name: "Dinner" },
    { name: "Happy Hour" },
  ];

  const activityRepository = AppDataSource.getRepository(Activity);
  const activities = await activityRepository.save(activitiesData);
  console.log("Activities created:", activities.map(a => a.name));

  // Create Places
  const placesData = [
    {
      name: "The Hot Spot Bar",
      address: "Puerto del Carmen",
      area: "Puerto Del Carmen",
      latitude: 28.920298329660845,
      longitude: -13.645361489015826,
      description: "Popular bar with breakfast, quiz nights, and bingo.",
    },
    {
      name: "The Irish Rover",
      address: "Calle Timanfaya, 1",
      area: "Puerto Del Carmen",
      latitude: 28.9200, // Example coordinates
      longitude: -13.6600, // Example coordinates
      description: "Traditional Irish pub with live music.",
    },
    {
      name: "La Casita",
      address: "Avenida de las Playas, 50",
      area: "Puerto Del Carmen",
      latitude: 28.9150,
      longitude: -13.6700,
      description: "Cozy restaurant with great breakfast.",
    },
    {
      name: "The Square",
      address: "Calle Gran Canaria, 10",
      area: "Costa Teguise",
      latitude: 28.9900,
      longitude: -13.5300,
      description: "Lively bar with quiz nights.",
    },
    {
      name: "El Chiringuito",
      address: "Playa Dorada, s/n",
      area: "Playa Blanca",
      latitude: 28.8600,
      longitude: -13.8200,
      description: "Beach bar with stunning views.",
    },
  ];

  const placeRepository = AppDataSource.getRepository(Place);
  const places = await placeRepository.save(placesData);
  console.log("Places created:", places.map(p => p.name));

  // Create some Events (linking places and activities)
  const eventsData = [
    // The Hot Spot Bar Events
    {
      place: places.find(p => p.name === "The Hot Spot Bar"),
      activity: activities.find(a => a.name === "Breakfast"),
      start_time: new Date(),
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
      description: "Breakfast served daily from 8:00 AM to 11:00 AM",
    },
    {
      place: places.find(p => p.name === "The Hot Spot Bar"),
      activity: activities.find(a => a.name === "Quiz Night"),
      start_time: new Date(),
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
      description: "Quiz Night - Friday, Saturday, Sunday, and Wednesday at 8:00 PM",
    },
    {
      place: places.find(p => p.name === "The Hot Spot Bar"),
      activity: activities.find(a => a.name === "Bingo"),
      start_time: new Date(),
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
      description: "Bingo Night - Tuesday and Thursday at 7:00 PM",
    },
    // Other existing events
    {
      place: places.find(p => p.name === "The Irish Rover"),
      activity: activities.find(a => a.name === "Live Music"),
      start_time: new Date(),
      end_time: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      description: "Live music every night!",
    },
    {
      place: places.find(p => p.name === "La Casita"),
      activity: activities.find(a => a.name === "Breakfast"),
      start_time: new Date(),
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
      description: "Delicious breakfast served daily.",
    },
    {
      place: places.find(p => p.name === "The Square"),
      activity: activities.find(a => a.name === "Quiz Night"),
      start_time: new Date(),
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
      description: "Test your knowledge!",
    },
  ];

  const eventRepository = AppDataSource.getRepository(Event);
  await eventRepository.save(eventsData);
  console.log("Events created.");

  await AppDataSource.destroy();
  console.log("Data Source disconnected.");
}

seed().catch(error => console.log(error));
