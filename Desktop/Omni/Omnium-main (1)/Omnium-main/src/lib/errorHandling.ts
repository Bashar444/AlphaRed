
import { useToast } from '@/hooks/use-toast';

export type ErrorType = 
  | 'auth_error'
  | 'validation_error'
  | 'network_error'
  | 'rate_limit_error'
  | 'permission_error'
  | 'generic_error';

export interface SecurityError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Secure error messages that don't expose system details
const ERROR_MESSAGES: Record<ErrorType, string> = {
  auth_error: 'Authentication failed. Please check your credentials.',
  validation_error: 'The information provided is invalid. Please check and try again.',
  network_error: 'Unable to connect. Please check your internet connection and try again.',
  rate_limit_error: 'Too many attempts. Please wait before trying again.',
  permission_error: 'You do not have permission to perform this action.',
  generic_error: 'Something went wrong. Please try again later.',
};

export const handleSecureError = (error: any, toast: ReturnType<typeof useToast>['toast']): SecurityError => {
  console.error('Security Error:', error); // Log for debugging (remove in production)

  let errorType: ErrorType = 'generic_error';
  let userMessage = ERROR_MESSAGES.generic_error;

  // Map specific error types to user-friendly messages
  if (error?.message?.includes('Invalid login credentials')) {
    errorType = 'auth_error';
    userMessage = ERROR_MESSAGES.auth_error;
  } else if (error?.message?.includes('rate limit')) {
    errorType = 'rate_limit_error';
    userMessage = ERROR_MESSAGES.rate_limit_error;
  } else if (error?.message?.includes('Permission denied')) {
    errorType = 'permission_error';
    userMessage = ERROR_MESSAGES.permission_error;
  } else if (error?.code === 'PGRST116') {
    errorType = 'permission_error';
    userMessage = 'Access denied. Please ensure you are logged in.';
  }

  const securityError: SecurityError = {
    type: errorType,
    message: userMessage,
    code: error?.code,
  };

  toast({
    title: "Error",
    description: userMessage,
    variant: "destructive",
  });

  return securityError;
};

export const logSecurityEvent = (event: string, details?: Record<string, any>) => {
  // In production, this would send to a security monitoring service
  console.log(`Security Event: ${event}`, details);
};
