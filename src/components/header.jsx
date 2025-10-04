import React, { useState } from 'react';

// SVG Icons
const CabIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
        <path d="M7 19V4.5a2.5 2.5 0 0 1 5 0V19" /><path d="M12 19h4" /><path d="M10 4.5h7.5a2.5 2.5 0 0 1 2.5 2.5V17" /><path d="m16 17-3 3 3 3" /><path d="M3 19h4" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

export default function Header() {
    const [profileOpen, setProfileOpen] = useState(false);
    const handleLogout = () => {
        localStorage.removeItem('userData');
        window.location.href = '/';
    };
    if (window.location.pathname === "/") {
        return null; // Don't render Header on the login page
    }
    return (
        <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-md shadow-md z-50">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                    <div className="bg-yellow-400 p-2 rounded-full">
                        <CabIcon />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">HRS Cabs</h1>
                </div>

                {/* Profile Section */}
                <div className="relative">
                    <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full focus:outline-none">
                        <UserIcon />
                    </button>
                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 py-1">
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
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
