import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { TrafficLog } from '../entity/TrafficLog';
import { Place } from '../entity/Place';
import { Activity } from '../entity/Activity';

const router = Router();

// Get traffic statistics
router.get('/traffic', async (req, res) => {
  try {
    const { period = '7d', limit = 10 } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get total traffic
    const totalTraffic = await AppDataSource.getRepository(TrafficLog)
      .createQueryBuilder('traffic')
      .where('traffic.createdAt >= :startDate', { startDate })
      .getCount();

    // Get traffic by action
    const trafficByAction = await AppDataSource.getRepository(TrafficLog)
      .createQueryBuilder('traffic')
      .select('traffic.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('traffic.createdAt >= :startDate', { startDate })
      .groupBy('traffic.action')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Get most viewed places
    const mostViewedPlaces = await AppDataSource.getRepository(TrafficLog)
      .createQueryBuilder('traffic')
      .leftJoinAndSelect('traffic.place', 'place')
      .select('place.name', 'placeName')
      .addSelect('place.id', 'placeId')
      .addSelect('COUNT(*)', 'viewCount')
      .where('traffic.action = :action', { action: 'view_place' })
      .andWhere('traffic.createdAt >= :startDate', { startDate })
      .groupBy('place.id, place.name')
      .orderBy('viewCount', 'DESC')
      .limit(parseInt(limit as string))
      .getRawMany();

    // Get most searched activities
    const mostSearchedActivities = await AppDataSource.getRepository(TrafficLog)
      .createQueryBuilder('traffic')
      .leftJoinAndSelect('traffic.activity', 'activity')
      .select('activity.name', 'activityName')
      .addSelect('activity.id', 'activityId')
      .addSelect('COUNT(*)', 'searchCount')
      .where('traffic.action = :action', { action: 'filter_by_activity' })
      .andWhere('traffic.createdAt >= :startDate', { startDate })
      .groupBy('activity.id, activity.name')
      .orderBy('searchCount', 'DESC')
      .limit(parseInt(limit as string))
      .getRawMany();

    // Get search queries
    const searchQueries = await AppDataSource.getRepository(TrafficLog)
      .createQueryBuilder('traffic')
      .select('traffic.searchQuery', 'query')
      .addSelect('COUNT(*)', 'count')
      .where('traffic.action = :action', { action: 'search' })
      .andWhere('traffic.searchQuery IS NOT NULL')
      .andWhere('traffic.createdAt >= :startDate', { startDate })
      .groupBy('traffic.searchQuery')
      .orderBy('count', 'DESC')
      .limit(parseInt(limit as string))
      .getRawMany();

    // Get hourly traffic distribution
    const hourlyTraffic = await AppDataSource.getRepository(TrafficLog)
      .createQueryBuilder('traffic')
      .select('HOUR(traffic.createdAt)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('traffic.createdAt >= :startDate', { startDate })
      .groupBy('HOUR(traffic.createdAt)')
      .orderBy('hour', 'ASC')
      .getRawMany();

    res.json({
      period,
      totalTraffic,
      trafficByAction,
      mostViewedPlaces,
      mostSearchedActivities,
      searchQueries,
      hourlyTraffic
    });
  } catch (error) {
    console.error('Error fetching traffic reports:', error);
    res.status(500).json({ message: 'Error fetching traffic reports' });
  }
});

// Get place-specific traffic
router.get('/traffic/place/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '7d' } = req.query;
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const place = await AppDataSource.getRepository(Place).findOneBy({ id: parseInt(id) });
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const totalViews = await AppDataSource.getRepository(TrafficLog)
      .createQueryBuilder('traffic')
      .where('traffic.placeId = :placeId', { placeId: id })
      .andWhere('traffic.action = :action', { action: 'view_place' })
      .andWhere('traffic.createdAt >= :startDate', { startDate })
      .getCount();

    const dailyViews = await AppDataSource.getRepository(TrafficLog)
      .createQueryBuilder('traffic')
      .select('DATE(traffic.createdAt)', 'date')
      .addSelect('COUNT(*)', 'views')
      .where('traffic.placeId = :placeId', { placeId: id })
      .andWhere('traffic.action = :action', { action: 'view_place' })
      .andWhere('traffic.createdAt >= :startDate', { startDate })
      .groupBy('DATE(traffic.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    res.json({
      place: {
        id: place.id,
        name: place.name,
        address: place.address,
        area: place.area
      },
      period,
      totalViews,
      dailyViews
    });
  } catch (error) {
    console.error('Error fetching place traffic:', error);
    res.status(500).json({ message: 'Error fetching place traffic' });
  }
});

// Get activity search statistics
router.get('/traffic/activities', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const activityStats = await AppDataSource.getRepository(TrafficLog)
      .createQueryBuilder('traffic')
      .leftJoinAndSelect('traffic.activity', 'activity')
      .select('activity.name', 'activityName')
      .addSelect('activity.id', 'activityId')
      .addSelect('COUNT(*)', 'searchCount')
      .where('traffic.action = :action', { action: 'filter_by_activity' })
      .andWhere('traffic.createdAt >= :startDate', { startDate })
      .groupBy('activity.id, activity.name')
      .orderBy('searchCount', 'DESC')
      .getRawMany();

    res.json({
      period,
      activityStats
    });
  } catch (error) {
    console.error('Error fetching activity traffic:', error);
    res.status(500).json({ message: 'Error fetching activity traffic' });
  }
});

export default router;
