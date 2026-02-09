import { Injectable } from '@angular/core';

/**
 * StorageService
 * Wrapper for localStorage and sessionStorage operations
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  /**
   * Save data to localStorage
   */
  setLocal(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  /**
   * Get data from localStorage
   */
  getLocal(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   */
  removeLocal(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage', error);
    }
  }

  /**
   * Clear all localStorage
   */
  clearLocal(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  /**
   * Save data to sessionStorage
   */
  setSession(key: string, value: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to sessionStorage', error);
    }
  }

  /**
   * Get data from sessionStorage
   */
  getSession(key: string): any {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from sessionStorage', error);
      return null;
    }
  }

  /**
   * Remove data from sessionStorage
   */
  removeSession(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from sessionStorage', error);
    }
  }

  /**
   * Clear all sessionStorage
   */
  clearSession(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage', error);
    }
  }
}
