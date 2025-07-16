import NetInfo from '@react-native-community/netinfo';

class NetworkUtil {
  private isOnlineState = true;
  private listeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Subscribe to network state changes
    NetInfo.addEventListener(state => {
      const isConnected = state.isConnected && state.isInternetReachable;
      this.isOnlineState = isConnected ?? false;
      this.notifyListeners(this.isOnlineState);
    });

    // Get initial network state
    this.checkConnection();
  }

  async checkConnection(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      const isConnected = state.isConnected && state.isInternetReachable;
      this.isOnlineState = isConnected ?? false;
      return this.isOnlineState;
    } catch (error) {
      console.error('Error checking network connection:', error);
      return false;
    }
  }

  isOnline(): boolean {
    return this.isOnlineState;
  }

  isOffline(): boolean {
    return !this.isOnlineState;
  }

  addListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  // Get detailed connection info
  async getConnectionInfo() {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
      };
    } catch (error) {
      console.error('Error getting connection info:', error);
      return null;
    }
  }
}

export const networkUtil = new NetworkUtil(); 