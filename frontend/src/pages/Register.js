import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one digit');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
    });

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1a2332] rounded-lg p-8 border border-[#2a3444]">
        <h1 className="text-3xl font-bold text-[#f5f5f0] mb-2">Create Account</h1>
        <p className="text-[#b0b0b0] mb-8">Join the LXI founders</p>

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="text-[#f5f5f0]">
                First Name
              </Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
              />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-[#f5f5f0]">
                Last Name
              </Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-[#f5f5f0]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-[#f5f5f0]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
            />
            <p className="text-xs text-[#b0b0b0] mt-1">
              Min 8 chars, 1 uppercase, 1 number
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-[#f5f5f0]">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#d4af37] text-[#0a0e17] hover:bg-[#e5c158] font-semibold"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-[#b0b0b0] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#d4af37] hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
