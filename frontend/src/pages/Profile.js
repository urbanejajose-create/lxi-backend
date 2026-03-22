import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await userService.updateProfile(formData);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] px-4 py-20">
      <div className="max-w-2xl mx-auto bg-[#1a2332] rounded-lg p-8 border border-[#2a3444]">
        <h1 className="text-3xl font-bold text-[#f5f5f0] mb-8">My Profile</h1>

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500 bg-green-500/10">
            <AlertDescription className="text-green-500">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Info */}
          <div className="bg-[#0a0e17] p-4 rounded border border-[#2a3444]">
            <p className="text-[#b0b0b0] text-sm">Email</p>
            <p className="text-[#f5f5f0] text-lg font-semibold">{user?.email}</p>
          </div>

          {/* Editable Fields */}
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
                className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-[#f5f5f0]">
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-[#f5f5f0]">
              Address
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St"
              className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-[#f5f5f0]">
                City
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
              />
            </div>
            <div>
              <Label htmlFor="country" className="text-[#f5f5f0]">
                Country
              </Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="USA"
                className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#d4af37] text-[#0a0e17] hover:bg-[#e5c158] font-semibold"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}
