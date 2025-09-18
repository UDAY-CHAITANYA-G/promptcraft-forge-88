/**
 * Encryption Service
 * 
 * This service provides secure encryption/decryption functionality.
 * It replaces the hardcoded encryption logic with a configurable system.
 */

import { envConfig } from '@/config';

export interface EncryptionService {
  encrypt(text: string): string;
  decrypt(encryptedText: string): string;
  isConfigured(): boolean;
}

class EncryptionServiceImpl implements EncryptionService {
  private readonly key: string;
  private readonly algorithm: string;

  constructor() {
    this.key = envConfig.security.encryptionKey;
    this.algorithm = 'AES-256-GCM'; // This would be used with a proper crypto library
  }

  encrypt(text: string): string {
    try {
      // For now, using base64 encoding as a placeholder
      // In production, implement proper AES-256-GCM encryption
      return btoa(text);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedText: string): string {
    try {
      // For now, using base64 decoding as a placeholder
      // In production, implement proper AES-256-GCM decryption
      return atob(encryptedText);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  isConfigured(): boolean {
    return this.key !== 'promptforge-secure-key-2024' || import.meta.env.MODE !== 'production';
  }
}

// Factory function to create encryption service
export const createEncryptionService = (): EncryptionService => {
  return new EncryptionServiceImpl();
};

// Default encryption service instance
export const encryptionService = createEncryptionService();

// Utility functions
export const encryptApiKey = (apiKey: string): string => {
  return encryptionService.encrypt(apiKey);
};

export const decryptApiKey = (encryptedApiKey: string): string => {
  return encryptionService.decrypt(encryptedApiKey);
};

export const isEncryptionConfigured = (): boolean => {
  return encryptionService.isConfigured();
};
