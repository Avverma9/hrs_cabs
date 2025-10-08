import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CarTaxiFront, User } from 'lucide-react';

export default function Header() {
    const [profileOpen, setProfileOpen] = useState(false);
    const handleLogout = () => {
        localStorage.removeItem('userData');
        window.location.href = '/login';
    };
    if (window.location.pathname === "/login" ) {
        return null; // Don't render Header on the login page.
    }
    return (
        <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-md shadow-md z-50">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link to="/home" className="flex items-center space-x-3">
                    <div className="bg-yellow-400 p-2 rounded-full transition-transform hover:scale-110">
                        <CarTaxiFront className="text-gray-800" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">HRS Cabs</h1>
                </Link>

                {/* Profile Section */}
                <div className="relative">
                    <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full focus:outline-none text-white">
                        <User size={24} />
                    </button>
                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 py-1">
                            <Link to="/home" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Ride</Link>
                            <Link to="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bookings</Link>
                            <Link to="/add-car" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Add Car</Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}
