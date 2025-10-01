
import DOMPurify from 'dompurify';
import { z } from 'zod';

// Content sanitization
export const sanitizeHTML = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
};

export const sanitizeText = (text: string): string => {
  return text.replace(/<[^>]*>/g, '').trim();
};

// Validation schemas
export const postSchema = z.object({
  content: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5000 characters')
    .refine((content) => content.trim().length > 0, 'Content cannot be empty'),
  visibility: z.enum(['public', 'connections', 'private']).default('public'),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comment is required')
    .max(1000, 'Comment must be less than 1000 characters')
    .refine((content) => content.trim().length > 0, 'Comment cannot be empty'),
});

export const profileSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  company: z.string().max(100, 'Company must be less than 100 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

export const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message is required')
    .max(2000, 'Message must be less than 2000 characters')
    .refine((content) => content.trim().length > 0, 'Message cannot be empty'),
});

// Rate limiting helpers
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return {
    checkLimit: (identifier: string): boolean => {
      const now = Date.now();
      const userAttempts = attempts.get(identifier);

      if (!userAttempts || now > userAttempts.resetTime) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
      }

      if (userAttempts.count >= maxAttempts) {
        return false;
      }

      userAttempts.count++;
      return true;
    },
    
    getRemainingTime: (identifier: string): number => {
      const userAttempts = attempts.get(identifier);
      if (!userAttempts) return 0;
      return Math.max(0, userAttempts.resetTime - Date.now());
    }
  };
};

// Auth rate limiter (5 attempts per 15 minutes)
export const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000);
