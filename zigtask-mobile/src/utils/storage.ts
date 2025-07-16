import AsyncStorage from '@react-native-async-storage/async-storage';
import { CachedData, OfflineAction } from '../types';

const CACHE_PREFIX = 'zigtask_cache_';
const OFFLINE_ACTIONS_KEY = 'zigtask_offline_actions';

class StorageUtil {
  // Cache data with timestamp
  async cacheData<T>(key: string, data: T): Promise<void> {
    try {
      const cachedData: CachedData<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify(cachedData)
      );
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  // Get cached data if still valid
  async getCachedData<T>(
    key: string,
    maxAge: number = 1000 * 60 * 5 // 5 minutes default
  ): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cachedData: CachedData<T> = JSON.parse(cached);
      const isExpired = Date.now() - cachedData.timestamp > maxAge;

      if (isExpired) {
        await this.removeCachedData(key);
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  // Remove cached data
  async removeCachedData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Error removing cached data:', error);
    }
  }

  // Store offline actions for later sync
  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    try {
      const existingActions = await this.getOfflineActions();
      const newAction: OfflineAction = {
        ...action,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      const updatedActions = [...existingActions, newAction];
      await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(updatedActions));
    } catch (error) {
      console.error('Error adding offline action:', error);
    }
  }

  // Get all offline actions
  async getOfflineActions(): Promise<OfflineAction[]> {
    try {
      const actions = await AsyncStorage.getItem(OFFLINE_ACTIONS_KEY);
      return actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.error('Error getting offline actions:', error);
      return [];
    }
  }

  // Remove offline action after successful sync
  async removeOfflineAction(actionId: string): Promise<void> {
    try {
      const existingActions = await this.getOfflineActions();
      const filteredActions = existingActions.filter(action => action.id !== actionId);
      await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(filteredActions));
    } catch (error) {
      console.error('Error removing offline action:', error);
    }
  }

  // Clear all offline actions
  async clearOfflineActions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_ACTIONS_KEY);
    } catch (error) {
      console.error('Error clearing offline actions:', error);
    }
  }

  // Clear all cached data
  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Generic storage methods
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item:', error);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting object:', error);
    }
  }

  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting object:', error);
      return null;
    }
  }
}

export const storage = new StorageUtil(); 