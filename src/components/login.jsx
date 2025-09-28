import axios from 'axios';
import React, { useState } from 'react';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    axios.post(`${baseUrl}/login/dashboard/user`, { email, password })
      .then(response => {
        // Handle success response
        console.log('Login successful:', response.data);
        localStorage.setItem('userData', JSON.stringify(response.data));
        setSuccess('Login successful! Redirecting...');

        // Redirect to /home after a short delay
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      })
      .catch(error => {
        // Handle error response
        console.error('Login failed:', error);
        setError('Invalid credentials. Please try again.');
      });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-yellow-400 p-3 rounded-full mb-4">
            <CabIcon />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">HRS Cabs</h1>
          <p className="text-gray-500 mt-2">Welcome back! Please login to your account.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Error and Success Messages */}
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}

          {/* Submit Button */}
          <div className="mb-6">
            <button
              type="submit"
              className="w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition duration-300 transform hover:-translate-y-1"
            >
              Log In
            </button>
          </div>

          {/* Links */}
          <div className="text-center text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot Password?
            </a>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-700 font-semibold">
                Want to be a partner of HRS Cabs?
            </p>
            <p className="text-gray-500 text-sm mt-2">
                Contact us to get your login details and start your journey with us.
            </p>
            <div className="mt-4 space-y-2">
                <p className="text-gray-800">
                    <strong>Phone:</strong> <a href="tel:+910123456789" className="text-blue-600 hover:underline">+91 012 345 6789</a>
                </p>
                <p className="text-gray-800">
                    <strong>Email:</strong> <a href="mailto:partners@hrscabs.com" className="text-blue-600 hover:underline">partners@hrscabs.com</a>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
