/**
 * Error Handling Service
 * 
 * This service provides centralized error handling to eliminate duplication
 * across hooks and services.
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  context?: string;
}

export interface ErrorHandlingOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  context?: string;
}

class ErrorHandlingService {
  // Standard error messages
  private readonly standardMessages = {
    // Authentication errors
    AUTH_REQUIRED: 'User authentication required',
    AUTH_FAILED: 'Authentication failed',
    AUTH_EXPIRED: 'Authentication session expired',
    
    // API errors
    API_CONNECTION_FAILED: 'Failed to connect to API',
    API_TIMEOUT: 'API request timed out',
    API_RATE_LIMITED: 'API rate limit exceeded',
    API_INVALID_KEY: 'Invalid API key provided',
    API_QUOTA_EXCEEDED: 'API quota exceeded',
    
    // Database errors
    DB_CONNECTION_FAILED: 'Database connection failed',
    DB_QUERY_FAILED: 'Database query failed',
    DB_TABLE_NOT_FOUND: 'Database table not found',
    
    // Validation errors
    VALIDATION_FAILED: 'Validation failed',
    INVALID_INPUT: 'Invalid input provided',
    MISSING_REQUIRED_FIELD: 'Required field is missing',
    
    // Service errors
    SERVICE_UNAVAILABLE: 'Service is currently unavailable',
    SERVICE_CONFIGURATION_ERROR: 'Service configuration error',
    SERVICE_INITIALIZATION_FAILED: 'Service initialization failed',
    
    // Generic errors
    UNKNOWN_ERROR: 'An unknown error occurred',
    NETWORK_ERROR: 'Network error occurred',
    PERMISSION_DENIED: 'Permission denied',
  };

  // Extract error message from various error types
  extractErrorMessage(error: unknown, fallbackMessage?: string): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    
    return fallbackMessage || this.standardMessages.UNKNOWN_ERROR;
  }

  // Get standard error message by code
  getStandardMessage(code: keyof typeof this.standardMessages): string {
    return this.standardMessages[code];
  }

  // Create error info object
  createErrorInfo(error: unknown, context?: string): ErrorInfo {
    return {
      message: this.extractErrorMessage(error),
      code: this.getErrorCode(error),
      details: this.getErrorDetails(error),
      timestamp: new Date(),
      context,
    };
  }

  // Get error code from error object
  private getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
      return String(error.code);
    }
    
    if (error && typeof error === 'object' && 'name' in error) {
      return String(error.name);
    }
    
    return undefined;
  }

  // Get error details from error object
  private getErrorDetails(error: unknown): any {
    if (error && typeof error === 'object') {
      const { message, code, name, ...details } = error as any;
      return Object.keys(details).length > 0 ? details : undefined;
    }
    
    return undefined;
  }

  // Handle error with options
  handleError(
    error: unknown,
    options: ErrorHandlingOptions = {}
  ): ErrorInfo {
    const {
      showToast = false,
      logError = true,
      fallbackMessage,
      context,
    } = options;

    const errorInfo = this.createErrorInfo(error, context);

    // Log error if requested
    if (logError) {
      console.error('Error handled:', errorInfo);
    }

    // Show toast if requested (this would integrate with toast service)
    if (showToast) {
      // This would be implemented with the actual toast service
      console.warn('Toast notification:', errorInfo.message);
    }

    return errorInfo;
  }

  // Common error handling patterns for hooks
  createHookErrorHandler(context: string) {
    return (error: unknown, fallbackMessage?: string) => {
      return this.handleError(error, {
        context,
        fallbackMessage,
        logError: true,
      });
    };
  }

  // Common error handling patterns for services
  createServiceErrorHandler(serviceName: string) {
    return (error: unknown, operation: string, fallbackMessage?: string) => {
      return this.handleError(error, {
        context: `${serviceName}.${operation}`,
        fallbackMessage,
        logError: true,
      });
    };
  }

  // Validate error handling
  isValidError(error: unknown): boolean {
    return error !== null && error !== undefined;
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error: unknown): string {
    const errorInfo = this.createErrorInfo(error);
    
    // Map technical errors to user-friendly messages
    const userFriendlyMap: { [key: string]: string } = {
      'NetworkError': 'Please check your internet connection and try again',
      'TimeoutError': 'The request took too long. Please try again',
      'ValidationError': 'Please check your input and try again',
      'AuthenticationError': 'Please log in again to continue',
      'PermissionError': 'You do not have permission to perform this action',
      'NotFoundError': 'The requested resource was not found',
      'RateLimitError': 'Too many requests. Please wait a moment and try again',
    };

    // Check for specific error codes
    if (errorInfo.code && userFriendlyMap[errorInfo.code]) {
      return userFriendlyMap[errorInfo.code];
    }

    // Check for specific error messages
    const message = errorInfo.message.toLowerCase();
    if (message.includes('network') || message.includes('connection')) {
      return userFriendlyMap['NetworkError'];
    }
    if (message.includes('timeout')) {
      return userFriendlyMap['TimeoutError'];
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return userFriendlyMap['ValidationError'];
    }
    if (message.includes('auth') || message.includes('login')) {
      return userFriendlyMap['AuthenticationError'];
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return userFriendlyMap['PermissionError'];
    }
    if (message.includes('not found') || message.includes('404')) {
      return userFriendlyMap['NotFoundError'];
    }
    if (message.includes('rate limit') || message.includes('too many')) {
      return userFriendlyMap['RateLimitError'];
    }

    // Return original message if no mapping found
    return errorInfo.message;
  }
}

// Export service instance
export const errorHandlingService = new ErrorHandlingService();

// Export utility functions
export const extractErrorMessage = (error: unknown, fallbackMessage?: string): string => {
  return errorHandlingService.extractErrorMessage(error, fallbackMessage);
};

export const createErrorInfo = (error: unknown, context?: string): ErrorInfo => {
  return errorHandlingService.createErrorInfo(error, context);
};

export const handleError = (error: unknown, options?: ErrorHandlingOptions): ErrorInfo => {
  return errorHandlingService.handleError(error, options);
};

export const getUserFriendlyMessage = (error: unknown): string => {
  return errorHandlingService.getUserFriendlyMessage(error);
};

// Common error handling patterns
export const createHookErrorHandler = (context: string) => {
  return errorHandlingService.createHookErrorHandler(context);
};

export const createServiceErrorHandler = (serviceName: string) => {
  return errorHandlingService.createServiceErrorHandler(serviceName);
};

