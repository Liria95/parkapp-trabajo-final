import { useState } from 'react';

interface ValidationRules {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  phone?: boolean;
  match?: string;
}

interface FieldConfig {
  [key: string]: ValidationRules;
}

interface UseFormValidationReturn {
  errors: Record<string, string>;
  validateField: (field: string, value: string, rules: ValidationRules, compareValue?: string) => boolean;
  validateForm: (values: Record<string, string>, config: FieldConfig) => boolean;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
}

export const useFormValidation = (): UseFormValidationReturn => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateField = (
    field: string, 
    value: string, 
    rules: ValidationRules, 
    compareValue?: string
  ): boolean => {
    let errorMessage = '';

    // Required validation
    if (rules.required && !value.trim()) {
      errorMessage = `${field} es requerido`;
    }
    // Email validation
    else if (rules.email && value && !validateEmail(value)) {
      errorMessage = 'Formato de email inválido';
    }
    // Min length validation
    else if (rules.minLength && value && value.length < rules.minLength) {
      errorMessage = `${field} debe tener al menos ${rules.minLength} caracteres`;
    }
    // Phone validation
    else if (rules.phone && value && !validatePhone(value)) {
      errorMessage = 'Formato de teléfono inválido';
    }
    // Match validation (for confirm password)
    else if (rules.match && compareValue && value !== compareValue) {
      errorMessage = 'Las contraseñas no coinciden';
    }

    if (errorMessage) {
      setError(field, errorMessage);
      return false;
    } else {
      clearError(field);
      return true;
    }
  };

  const validateForm = (values: Record<string, string>, config: FieldConfig): boolean => {
    let isValid = true;
    clearAllErrors();

    for (const [field, rules] of Object.entries(config)) {
      const value = values[field] || '';
      const compareValue = rules.match ? values[rules.match] : undefined;
      
      if (!validateField(field, value, rules, compareValue)) {
        isValid = false;
      }
    }

    return isValid;
  };

  const setError = (field: string, message: string): void => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearError = (field: string): void => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearAllErrors = (): void => {
    setErrors({});
  };

  return {
    errors,
    validateField,
    validateForm,
    setError,
    clearError,
    clearAllErrors,
  };
};