import { useCallback } from 'react';
import { 
  initializeServices, 
  getServicesHealth, 
  getService,
  type ServiceHealth 
} from '@/services/services';
import { useToast } from './use-toast';

export function useServices() {
  const { toast } = useToast();

  // Initialize all services
  const initialize = useCallback(async () => {
    try {
      await initializeServices();
      toast({
        title: "Services Initialized",
        description: "All application services have been initialized successfully",
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize services';
      toast({
        title: "Service Initialization Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Get health status of all services
  const getHealth = useCallback(async (): Promise<ServiceHealth> => {
    try {
      const health = await getServicesHealth();
      return health;
    } catch (error) {
      console.error('Failed to get service health:', error);
      return {};
    }
  }, []);

  // Get a specific service by name
  const getServiceByName = useCallback(async <T extends string>(serviceName: T) => {
    try {
      return await getService(serviceName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to get service: ${serviceName}`;
      toast({
        title: "Service Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Check if all critical services are healthy
  const areServicesHealthy = useCallback(async (): Promise<boolean> => {
    try {
      const health = await getHealth();
      const criticalServices = ['apiConfig', 'email'];
      
      return criticalServices.every(serviceName => {
        const serviceHealth = health[serviceName];
        return serviceHealth && serviceHealth.status === 'healthy';
      });
    } catch (error) {
      console.error('Failed to check service health:', error);
      return false;
    }
  }, [getHealth]);

  // Get service status summary
  const getServiceStatusSummary = useCallback(async () => {
    try {
      const health = await getHealth();
      const totalServices = Object.keys(health).length;
      const healthyServices = Object.values(health).filter(
        service => service.status === 'healthy'
      ).length;
      const unhealthyServices = totalServices - healthyServices;

      return {
        total: totalServices,
        healthy: healthyServices,
        unhealthy: unhealthyServices,
        healthPercentage: totalServices > 0 ? (healthyServices / totalServices) * 100 : 0,
        details: health,
      };
    } catch (error) {
      console.error('Failed to get service status summary:', error);
      return {
        total: 0,
        healthy: 0,
        unhealthy: 0,
        healthPercentage: 0,
        details: {},
      };
    }
  }, [getHealth]);

  return {
    initialize,
    getHealth,
    getServiceByName,
    areServicesHealthy,
    getServiceStatusSummary,
  };
}
