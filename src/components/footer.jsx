import React from 'react';

// Icon for the cab, used in the footer
const CabIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
        <path d="M7 19V4.5a2.5 2.5 0 0 1 5 0V19" /><path d="M12 19h4" /><path d="M10 4.5h7.5a2.5 2.5 0 0 1 2.5 2.5V17" /><path d="m16 17-3 3 3 3" /><path d="M3 19h4" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
    </svg>
);

// Social media icons object
const socialIcons = {
    twitter: (
        <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
        </svg>
    ),
    facebook: (
        <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
        </svg>
    ),
    instagram: (
        <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
        </svg>
    ),
    linkedin: (
        <svg fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0" className="w-5 h-5" viewBox="0 0 24 24">
            <path stroke="none" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
            <circle cx="4" cy="4" r="2" stroke="none"></circle>
        </svg>
    )
};

// --- Footer Component ---
export default function Footer() {
    if (window.location.pathname === "/") {
        return null; // Don't render Footer on the login page
    }
    return (
        <footer className="bg-gray-800 text-gray-400 font-sans bottom-0 w-full z-50 hidden sm:block">
            <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
                <a className="flex title-font font-medium items-center md:justify-start justify-center text-white">
                    <div className="bg-yellow-400 p-2 rounded-full">
                        <CabIcon />
                    </div>
                    <span className="ml-3 text-xl">HRS Cabs</span>
                </a>
                <p className="text-sm text-gray-400 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-800 sm:py-2 sm:mt-0 mt-4">
                    © {new Date().getFullYear()} HRS Cabs —
                    <a href="https://twitter.com/hrscabs" className="text-gray-500 ml-1" target="_blank" rel="noopener noreferrer">@hrscabs</a>
                </p>
                <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
                    <a href="#" className="text-gray-400 hover:text-white">
                        {socialIcons.facebook}
                    </a>
                    <a href="#" className="ml-3 text-gray-400 hover:text-white">
                        {socialIcons.twitter}
                    </a>
                    <a href="#" className="ml-3 text-gray-400 hover:text-white">
                        {socialIcons.instagram}
                    </a>
                    <a href="#" className="ml-3 text-gray-400 hover:text-white">
                        {socialIcons.linkedin}
                    </a>
                </span>
            </div>
        </footer>
    );
}
