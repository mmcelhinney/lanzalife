import { AppDataSource } from '../data-source';
import { TrafficLog } from '../entity/TrafficLog';
import { Place } from '../entity/Place';
import { Activity } from '../entity/Activity';
import { User } from '../entity/User';

export interface TrafficLogData {
  action: string;
  searchQuery?: string;
  searchFilters?: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  placeId?: number;
  activityId?: number;
  userId?: number;
}

export class TrafficLogger {
  static async logTraffic(data: TrafficLogData): Promise<void> {
    try {
      const trafficLog = new TrafficLog();
      trafficLog.action = data.action;
      trafficLog.searchQuery = data.searchQuery;
      trafficLog.searchFilters = data.searchFilters;
      trafficLog.userAgent = data.userAgent;
      trafficLog.ipAddress = data.ipAddress;
      trafficLog.referrer = data.referrer;

      // Set relationships if IDs are provided
      if (data.placeId) {
        const place = await AppDataSource.getRepository(Place).findOneBy({ id: data.placeId });
        if (place) trafficLog.place = place;
      }

      if (data.activityId) {
        const activity = await AppDataSource.getRepository(Activity).findOneBy({ id: data.activityId });
        if (activity) trafficLog.activity = activity;
      }

      if (data.userId) {
        const user = await AppDataSource.getRepository(User).findOneBy({ id: data.userId });
        if (user) trafficLog.user = user;
      }

      await AppDataSource.getRepository(TrafficLog).save(trafficLog);
    } catch (error) {
      console.error('Error logging traffic:', error);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  static async logPlaceView(placeId: number, request: any): Promise<void> {
    await this.logTraffic({
      action: 'view_place',
      placeId,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip || request.connection.remoteAddress,
      referrer: request.headers.referer
    });
  }

  static async logSearch(searchQuery: string, filters: any, request: any): Promise<void> {
    await this.logTraffic({
      action: 'search',
      searchQuery,
      searchFilters: JSON.stringify(filters),
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip || request.connection.remoteAddress,
      referrer: request.headers.referer
    });
  }

  static async logActivityFilter(activityId: number, request: any): Promise<void> {
    await this.logTraffic({
      action: 'filter_by_activity',
      activityId,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip || request.connection.remoteAddress,
      referrer: request.headers.referer
    });
  }
}
