import React, { useState } from 'react';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { toast } from 'sonner';
import { newsletterService } from '../services/api';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await newsletterService.subscribe(email);
      setEmail('');
      toast.success('Successfully subscribed to our newsletter!');
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info('Already subscribed with this email');
      } else {
        toast.error('Failed to subscribe');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#1a2332] border-[#2a3444] text-[#f5f5f0] placeholder-[#5a6a7a] flex-1"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#d4af37] text-[#0a0e17] hover:bg-[#e0c158] font-semibold whitespace-nowrap"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </div>
    </form>
  );
}
