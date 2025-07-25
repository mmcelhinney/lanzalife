"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const data_source_1 = require("./data-source");
const dotenv = __importStar(require("dotenv"));
const Activity_1 = require("./entity/Activity");
const Place_1 = require("./entity/Place");
const Event_1 = require("./entity/Event");
const User_1 = require("./entity/User");
const auth_1 = __importDefault(require("./routes/auth"));
const jwt = __importStar(require("jsonwebtoken"));
const authorize_1 = require("./middleware/authorize");
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
// Auth routes
app.use('/api/auth', auth_1.default);
// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null)
        return res.sendStatus(401); // No token
    jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey', (err, user) => {
        if (err)
            return res.sendStatus(403); // Invalid token
        req.user = user;
        next();
    });
};
// Admin API endpoints - protected
app.post('/api/activities', authenticateToken, (0, authorize_1.authorizeRole)(['Admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const activity = new Activity_1.Activity();
        activity.name = name;
        const savedActivity = yield data_source_1.AppDataSource.getRepository(Activity_1.Activity).save(activity);
        res.status(201).json(savedActivity);
    }
    catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ error: 'Failed to create activity' });
    }
}));
app.put('/api/activities/:id', authenticateToken, (0, authorize_1.authorizeRole)(['Admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const activityRepository = data_source_1.AppDataSource.getRepository(Activity_1.Activity);
        const activity = yield activityRepository.findOne({ where: { id: parseInt(id) } });
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        activity.name = name;
        const updatedActivity = yield activityRepository.save(activity);
        res.json(updatedActivity);
    }
    catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({ error: 'Failed to update activity' });
    }
}));
app.post('/api/places', authenticateToken, (0, authorize_1.authorizeRole)(['Admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, address, area, latitude, longitude, description } = req.body;
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOneBy({ id: req.user.id });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const place = new Place_1.Place();
        place.name = name;
        place.address = address;
        place.area = area;
        place.latitude = latitude;
        place.longitude = longitude;
        place.description = description;
        place.user = user; // Associate the place with the creating user
        const savedPlace = yield data_source_1.AppDataSource.getRepository(Place_1.Place).save(place);
        res.status(201).json(savedPlace);
    }
    catch (error) {
        console.error('Error creating place:', error);
        res.status(500).json({ error: 'Failed to create place' });
    }
}));
app.put('/api/places/:id', authenticateToken, (0, authorize_1.authorizeRole)(['Admin', 'Place Owner']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, address, area, latitude, longitude, description } = req.body;
        const placeRepository = data_source_1.AppDataSource.getRepository(Place_1.Place);
        const place = yield placeRepository.findOne({ where: { id: parseInt(id) }, relations: ['user'] });
        if (!place) {
            return res.status(404).json({ error: 'Place not found' });
        }
        // If the user is a 'Place Owner', ensure they only edit their own place
        if (req.user.role === 'Place Owner' && place.user.id !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only edit your own places' });
        }
        place.name = name;
        place.address = address;
        place.area = area;
        place.latitude = latitude;
        place.longitude = longitude;
        place.description = description;
        const updatedPlace = yield placeRepository.save(place);
        res.json(updatedPlace);
    }
    catch (error) {
        console.error('Error updating place:', error);
        res.status(500).json({ error: 'Failed to update place' });
    }
}));
app.post('/api/events', authenticateToken, (0, authorize_1.authorizeRole)(['Admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const event = new Event_1.Event();
        event.place = { id: placeId };
        event.activity = { id: activityId };
        event.start_time = startDateTime;
        event.end_time = endDateTime;
        event.description = description;
        const savedEvent = yield data_source_1.AppDataSource.getRepository(Event_1.Event).save(event);
        res.status(201).json(savedEvent);
    }
    catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
}));
app.get('/api/activities', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const activities = yield data_source_1.AppDataSource.getRepository(Activity_1.Activity).find();
    res.json(activities);
}));
app.get('/api/places', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { area, activity, day, nearMe } = req.query;
    const query = data_source_1.AppDataSource.getRepository(Place_1.Place)
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
            dayOfWeek: parseInt(day) === 0 ? 1 : parseInt(day) + 1
        });
    }
    if (nearMe) {
        // For "Near Me" functionality, you could add geolocation filtering here
        // For now, we'll just return all places with events
        query.andWhere('event.id IS NOT NULL');
    }
    const places = yield query.getMany();
    res.json(places);
}));
app.get('/api/events', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield data_source_1.AppDataSource.getRepository(Event_1.Event)
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.place', 'place')
            .leftJoinAndSelect('event.activity', 'activity')
            .getMany();
        console.log('Backend: Events count:', events.length);
        console.log('Backend: First event:', events[0]);
        res.json(events);
    }
    catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
}));
app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});
app.get('/api/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const placesCount = yield data_source_1.AppDataSource.getRepository(Place_1.Place).count();
        const activitiesCount = yield data_source_1.AppDataSource.getRepository(Activity_1.Activity).count();
        const eventsCount = yield data_source_1.AppDataSource.getRepository(Event_1.Event).count();
        res.json({
            places: placesCount,
            activities: activitiesCount,
            events: eventsCount
        });
    }
    catch (error) {
        console.error('Error getting status:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
}));
data_source_1.AppDataSource.initialize()
    .then(() => {
    app.listen(port, () => {
        console.log(`Backend is running on http://localhost:${port}`);
    });
})
    .catch((error) => console.log(error));
