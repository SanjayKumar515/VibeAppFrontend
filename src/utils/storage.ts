import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async setItem(key: string, value: any) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.log('Error saving to storage:', e);
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log('Error reading from storage:', e);
      return null;
    }
  },

  async removeItem(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.log('Error removing from storage:', e);
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.log('Error clearing storage:', e);
    }
  }
};
