import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './data-source';
import * as dotenv from 'dotenv';
import { Activity } from './entity/Activity';
import { Place } from './entity/Place';
import { Event } from './entity/Event';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/api/activities', async (req, res) => {
  const activities = await AppDataSource.getRepository(Activity).find();
  res.json(activities);
});

app.post('/api/activities', async (req, res) => {
  try {
    const { name } = req.body;
    const activity = new Activity();
    activity.name = name;

    const savedActivity = await AppDataSource.getRepository(Activity).save(activity);
    res.status(201).json(savedActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const activityRepository = AppDataSource.getRepository(Activity);
    const activity = await activityRepository.findOne({ where: { id: parseInt(id) } });
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    activity.name = name;

    const updatedActivity = await activityRepository.save(activity);
    res.json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

app.get('/api/places', async (req, res) => {
  const { area, activity, day, nearMe } = req.query;
  const query = AppDataSource.getRepository(Place)
    .createQueryBuilder('place')
    .leftJoinAndSelect('place.events', 'event')
    .leftJoinAndSelect('event.activity', 'activity');

  if (area && !nearMe) {
    query.where('place.area = :area', { area });
  }

  if (activity) {
    query.andWhere('activity.id = :activity', { activity });
  }

  if (day) {
    // Filter events by day of week (0 = Sunday, 1 = Monday, etc.)
    query.andWhere('DAYOFWEEK(event.start_time) = :dayOfWeek', { 
      dayOfWeek: parseInt(day as string) === 0 ? 1 : parseInt(day as string) + 1 
    });
  }

  if (nearMe) {
    // For "Near Me" functionality, you could add geolocation filtering here
    // For now, we'll just return all places with events
    query.andWhere('event.id IS NOT NULL');
  }

  const places = await query.getMany();
  res.json(places);
});

// Admin API endpoints
app.post('/api/places', async (req, res) => {
  try {
    const { name, address, area, latitude, longitude, description } = req.body;
    const place = new Place();
    place.name = name;
    place.address = address;
    place.area = area;
    place.latitude = latitude;
    place.longitude = longitude;
    place.description = description;

    const savedPlace = await AppDataSource.getRepository(Place).save(place);
    res.status(201).json(savedPlace);
  } catch (error) {
    console.error('Error creating place:', error);
    res.status(500).json({ error: 'Failed to create place' });
  }
});

app.put('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, area, latitude, longitude, description } = req.body;
    
    const placeRepository = AppDataSource.getRepository(Place);
    const place = await placeRepository.findOne({ where: { id: parseInt(id) } });
    
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }
    
    place.name = name;
    place.address = address;
    place.area = area;
    place.latitude = latitude;
    place.longitude = longitude;
    place.description = description;

    const updatedPlace = await placeRepository.save(place);
    res.json(updatedPlace);
  } catch (error) {
    console.error('Error updating place:', error);
    res.status(500).json({ error: 'Failed to update place' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await AppDataSource.getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.place', 'place')
      .leftJoinAndSelect('event.activity', 'activity')
      .getMany();
    console.log('Backend: Events count:', events.length);
    console.log('Backend: First event:', events[0]);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { placeId, activityId, dayOfWeek, startTime, endTime, description } = req.body;
    
    // Create a date for the specified day of week
    const today = new Date();
    const daysUntilTarget = (dayOfWeek - today.getDay() + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    // Set the time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(targetDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(targetDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const event = new Event();
    event.place = { id: placeId } as Place;
    event.activity = { id: activityId } as Activity;
    event.start_time = startDateTime;
    event.end_time = endDateTime;
    event.description = description;

    const savedEvent = await AppDataSource.getRepository(Event).save(event);
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.get('/api/status', async (req, res) => {
  try {
    const placesCount = await AppDataSource.getRepository(Place).count();
    const activitiesCount = await AppDataSource.getRepository(Activity).count();
    const eventsCount = await AppDataSource.getRepository(Event).count();
    
    res.json({
      places: placesCount,
      activities: activitiesCount,
      events: eventsCount
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend is running on http://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error));
