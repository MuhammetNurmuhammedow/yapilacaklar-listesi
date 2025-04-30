import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-teal-500 shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="text-white h-8 w-8" />
            <h1 className="text-2xl font-bold text-white">Yapilacaklar</h1>
          </div>
          <div className="text-white text-sm">
            React + Go
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;