import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { isBlank, isValidEmail } from '../../utils/validation';
import { ApiError } from '../../api/apiError';

interface AdminLoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export const AdminLoginPage = ({ onLogin }: AdminLoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (isBlank(email)) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (isBlank(password)) {
      errors.password = 'Password is required.';
    }
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Admin login failed';
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f3d] to-[#173058] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#0066cc] text-white p-3 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-sm text-gray-500">Super admin access only</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent ${
                fieldErrors.email ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent ${
                fieldErrors.password ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0066cc] text-white py-3 rounded-lg font-semibold hover:bg-[#004080] transition disabled:opacity-70"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};
