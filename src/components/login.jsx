import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { baseUrl } from '../../baseUrl';
import { useNavigate } from 'react-router-dom';

const CabIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-800"
  >
    <path d="M7 19V4.5a2.5 2.5 0 0 1 5 0V19" />
    <path d="M12 19h4" />
    <path d="M10 4.5h7.5a2.5 2.5 0 0 1 2.5 2.5V17" />
    <path d="m16 17-3 3 3 3" />
    <path d="M3 19h4" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
  </svg>
);


export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUserData, setShowUserData] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.loggedUserId) {
          navigate('/home', { replace: true });
        }
      } catch (e) {}
    }
  }, [navigate]);
  // ...existing code...

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLogging(true);

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLogging(false);
      return;
    }

    axios.post(`${baseUrl}/login/dashboard/user`, { email, password })
      .then(response => {
        // Handle success response
        console.log('Login successful:', response.data);
        localStorage.setItem('userData', JSON.stringify(response.data));
        setUserData(response.data);
        setShowUserData(true);
        setSuccess('Login successful! Redirecting...');

        // Redirect to /home after a short delay
        setTimeout(() => {
          setShowUserData(false);
          setIsLogging(false);
          navigate('/home');
        }, 1500);
      })
      .catch(error => {
        // Handle error response
        console.error('Login failed:', error);
        setError('Invalid credentials. Please try again.');
        setIsLogging(false);
      });
  };

  // If redirected, don't render anything
  const stored = localStorage.getItem('userData');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.loggedUserId) {
        return null;
      }
    } catch (e) {}
  }

  // Render login JSX
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans p-2">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-4 sm:p-6 relative">
        {/* User Data Modal */}
        {showUserData && userData && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-4 max-w-xs w-full mx-2">
              <h2 className="text-lg font-bold mb-2 text-gray-800">User Data</h2>
              <pre className="text-xs bg-gray-100 rounded p-2 mb-2 overflow-x-auto max-h-60">{JSON.stringify(userData, null, 2)}</pre>
              <button
                className="w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-xs font-bold"
                onClick={() => setShowUserData(false)}
              >Close</button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="bg-yellow-400 p-2 rounded-full mb-2">
            <CabIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">HRS Cabs</h1>
          <p className="text-gray-500 mt-1 text-xs text-center">Welcome back! Please login to your account.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Input */}
          <div className="mb-3">
            <label htmlFor="email" className="block text-gray-700 text-xs font-bold mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-xs font-bold mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Error and Success Messages */}
          {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}
          {success && <p className="text-green-500 text-xs text-center mb-2">{success}</p>}

          {/* Submit Button */}
          <div className="mb-3">
            <button
              type="submit"
              className={`w-full bg-gray-800 text-white font-bold py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 text-sm transition duration-200 ${isLogging ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-900'}`}
              disabled={isLogging}
            >
              {isLogging ? 'Logging ...' : 'Log In'}
            </button>
          </div>

          {/* Links */}
          <div className="text-center text-xs">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot Password?
            </a>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-700 font-semibold text-sm">
                Want to be a partner of HRS Cabs?
            </p>
            <p className="text-gray-500 text-xs mt-1">
                Contact us to get your login details and start your journey with us.
            </p>
            <div className="mt-2 space-y-1">
                <p className="text-gray-800 text-xs">
                    <strong>Phone:</strong> <a href="tel:+910123456789" className="text-blue-600 hover:underline">+91 012 345 6789</a>
                </p>
                <p className="text-gray-800 text-xs">
                    <strong>Email:</strong> <a href="mailto:partners@hrscabs.com" className="text-blue-600 hover:underline">partners@hrscabs.com</a>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
