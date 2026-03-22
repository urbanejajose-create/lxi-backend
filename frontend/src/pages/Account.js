import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.jsx';
import { Button } from '../components/ui/button.jsx';
import { Alert, AlertDescription } from '../components/ui/alert.jsx';
import { LogOut } from 'lucide-react';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] px-4 py-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#f5f5f0]">Account Dashboard</h1>
          <Button
            onClick={handleLogout}
            className="bg-red-500/20 text-red-500 hover:bg-red-500/30 gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>

        {user && (
          <Alert className="mb-6 border-[#2a3444] bg-[#1a2332]">
            <AlertDescription className="text-[#f5f5f0]">
              Welcome, <span className="font-semibold">{user.first_name}</span>!
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#1a2332] border border-[#2a3444] w-full mb-6">
            <TabsTrigger value="profile" className="flex-1 data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0a0e17]">
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0a0e17]">
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex-1 data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0a0e17]">
              Wishlist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3444] p-6">
              <h2 className="text-xl font-semibold text-[#f5f5f0] mb-6">Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[#b0b0b0] text-sm">Email</p>
                  <p className="text-[#f5f5f0] font-semibold">{user?.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#b0b0b0] text-sm">First Name</p>
                    <p className="text-[#f5f5f0] font-semibold">{user?.first_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[#b0b0b0] text-sm">Last Name</p>
                    <p className="text-[#f5f5f0] font-semibold">{user?.last_name || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[#b0b0b0] text-sm">Phone</p>
                  <p className="text-[#f5f5f0] font-semibold">{user?.phone || 'Not provided'}</p>
                </div>

                <div>
                  <p className="text-[#b0b0b0] text-sm">Address</p>
                  <p className="text-[#f5f5f0] font-semibold">{user?.address || 'Not provided'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#b0b0b0] text-sm">City</p>
                    <p className="text-[#f5f5f0] font-semibold">{user?.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[#b0b0b0] text-sm">Country</p>
                    <p className="text-[#f5f5f0] font-semibold">{user?.country || 'N/A'}</p>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/profile')}
                  className="w-full mt-6 bg-[#d4af37] text-[#0a0e17] hover:bg-[#e0c158] font-semibold"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3444] p-6">
              <h2 className="text-xl font-semibold text-[#f5f5f0] mb-6">Order History</h2>
              <Button
                onClick={() => navigate('/orders')}
                className="w-full bg-[#d4af37] text-[#0a0e17] hover:bg-[#e0c158] font-semibold"
              >
                View All Orders
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="wishlist">
            <div className="bg-[#1a2332] rounded-lg border border-[#2a3444] p-6">
              <h2 className="text-xl font-semibold text-[#f5f5f0] mb-6">My Wishlist</h2>
              <Button
                onClick={() => navigate('/wishlist')}
                className="w-full bg-[#d4af37] text-[#0a0e17] hover:bg-[#e0c158] font-semibold"
              >
                View Wishlist
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
