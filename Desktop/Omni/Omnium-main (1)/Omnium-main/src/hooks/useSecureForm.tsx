
import { useState } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { sanitizeText, sanitizeHTML } from '@/lib/security';
import { handleSecureError } from '@/lib/errorHandling';

interface UseSecureFormOptions<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  sanitizeFields?: (keyof T)[];
  htmlFields?: (keyof T)[];
}

export const useSecureForm = <T extends Record<string, any>>({
  schema,
  onSubmit,
  sanitizeFields = [],
  htmlFields = [],
}: UseSecureFormOptions<T>) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setErrors({});

    try {
      // Extract form data
      const rawData: Record<string, any> = {};
      for (const [key, value] of formData.entries()) {
        rawData[key] = value;
      }

      // Sanitize specified fields
      const sanitizedData = { ...rawData };
      
      sanitizeFields.forEach((field) => {
        const fieldKey = String(field);
        if (sanitizedData[fieldKey]) {
          sanitizedData[fieldKey] = sanitizeText(sanitizedData[fieldKey] as string);
        }
      });

      htmlFields.forEach((field) => {
        const fieldKey = String(field);
        if (sanitizedData[fieldKey]) {
          sanitizedData[fieldKey] = sanitizeHTML(sanitizedData[fieldKey] as string);
        }
      });

      // Validate with schema
      const validatedData = schema.parse(sanitizedData);

      // Submit the data
      await onSubmit(validatedData);

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        
        toast({
          title: "Validation Error",
          description: "Please check the form and try again.",
          variant: "destructive",
        });
      } else {
        handleSecureError(error, toast);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    loading,
    errors,
    getError: (field: string) => errors[field],
    hasError: (field: string) => !!errors[field],
  };
};
