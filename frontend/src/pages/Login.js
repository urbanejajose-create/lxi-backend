import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      navigate(result.user?.is_admin ? '/admin' : '/');
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1a2332] rounded-lg p-8 border border-[#2a3444]">
        <h1 className="text-3xl font-bold text-[#f5f5f0] mb-2">Login</h1>
        <p className="text-[#b0b0b0] mb-8">Access your LXI account</p>

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-[#f5f5f0]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#d4af37] text-[#0a0e17] hover:bg-[#e5c158] font-semibold"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-[#b0b0b0] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#d4af37] hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
