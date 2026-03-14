import React from 'react';
import useAuth from '../hooks/useAuth';
import PageWrapper from '../components/layout/PageWrapper';
import { User, Mail, Phone, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <PageWrapper 
      title="My Profile" 
      description="View your personal account information."
    >
      <div className="max-w-2xl mt-4">
        <div className="card overflow-hidden">
          <div className="bg-blue-50 p-8 flex flex-col items-center justify-center border-b border-gray-200">
            <div className="h-24 w-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 ring-4 ring-white">
              <User className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h2>
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white font-medium text-xs text-gray-600 border border-gray-200">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span className="capitalize">{user?.role || 'Staff'}</span>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-base text-gray-900 mt-1">{user?.email || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-base text-gray-900 mt-1">{user?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
