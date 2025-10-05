import React, { useState, useEffect, useCallback } from 'react';
import { baseUrl } from '../../../baseUrl';
import { userId } from '../../../util/configs';

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md border border-red-200">
    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Error Loading Bookings</h2>
    <p className="text-gray-500 mb-6">{message}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-200"
    >
      <RefreshIcon />
      <span className="ml-2">Try Again</span>
    </button>
  </div>
);

const SeatSelection = ({ booking, allBookings, tempSeats, setTempSeats }) => {
  const occupiedSeatNumbers = allBookings
    .filter(b => b.carId === booking.carId && b._id !== booking._id)
    .flatMap(b => b.seats.map(s => s.seatNumber));

  const allSeatsForCar = booking.availableSeatsOnCar || [];

  const handleSeatClick = (seat) => {
    const isAlreadySelected = tempSeats.some(s => s.seatNumber === seat.seatNumber);

    if (isAlreadySelected) {
      setTempSeats(tempSeats.filter(s => s.seatNumber !== seat.seatNumber));
    } else {
      if (tempSeats.length < booking.seats.length) {
        setTempSeats([...tempSeats, seat]);
      } else {
        alert(`You can only select ${booking.seats.length} seat(s). Please deselect one before choosing another.`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Change Your Seat(s)</h3>
        <p className="text-sm text-gray-500">You have {booking.seats.length} seat(s) booked. You can change your selection below.</p>
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
        {allSeatsForCar.map(seat => {
          const isSelectedByCurrentUser = tempSeats.some(s => s.seatNumber === seat.seatNumber);
          const isOccupiedByOther = occupiedSeatNumbers.includes(seat.seatNumber);

          let seatClass = "p-3 rounded-xl text-center cursor-pointer transition-all duration-200 border-2 font-medium ";
          if (isOccupiedByOther) {
            seatClass += "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300";
          } else if (isSelectedByCurrentUser) {
            seatClass += "bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-400 shadow-lg transform scale-105";
          } else {
            seatClass += "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300 hover:border-emerald-400 hover:shadow-md";
          }

          return (
            <button 
              key={seat.seatNumber} 
              disabled={isOccupiedByOther} 
              onClick={() => handleSeatClick(seat)} 
              className={seatClass}
            >
              <div className="text-lg font-bold">{seat.seatNumber}</div>
              <div className="text-xs mt-1">{seat.seatType}</div>
              <div className="text-xs font-medium">₹{seat.seatPrice}</div>
            </button>
          );
        })}
      </div>
      
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-lg bg-indigo-600 mr-2"></span>
          <span>Your Selection</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-lg bg-emerald-50 border border-emerald-300 mr-2"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-lg bg-gray-200 border mr-2"></span>
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );
};

const BookingModal = ({ booking, onClose, onUpdate, allBookings }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [tempSeats, setTempSeats] = useState(booking.seats);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async () => {
    setIsUpdating(true);
    try {
      const newPrice = tempSeats.reduce((acc, seat) => acc + seat.seatPrice, 0);
      const updatedBooking = { ...booking, seats: tempSeats, price: newPrice };
      
      await onUpdate(updatedBooking);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const newTotalPrice = tempSeats.reduce((acc, seat) => acc + seat.seatPrice, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <p className="text-indigo-100 mt-1">ID: {booking.bookingId}</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {showSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-center font-medium">
              Booking updated successfully!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Passenger Name</p>
              <p className="font-semibold text-gray-800">{booking.bookedBy}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Email Address</p>
              <p className="font-semibold text-gray-800">{booking.customerEmail}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Mobile Number</p>
              <p className="font-semibold text-gray-800">{booking.customerMobile}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Vehicle</p>
              <p className="font-semibold text-gray-800">{booking.vehicleType} - {booking.vehicleNumber}</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <SeatSelection 
              booking={booking} 
              allBookings={allBookings} 
              tempSeats={tempSeats} 
              setTempSeats={setTempSeats} 
            />
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Updated Payment Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{tempSeats.length}</p>
                <p className="text-sm text-gray-600">Selected Seats</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(newTotalPrice)}</p>
                <p className="text-sm text-gray-600">New Total Fare</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{formatCurrency(Math.abs(newTotalPrice - booking.price))}</p>
                <p className="text-sm text-gray-600">{newTotalPrice > booking.price ? 'Additional' : 'Refund'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleSubmit} 
              disabled={tempSeats.length !== booking.seats.length || isUpdating}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Confirm Changes'
              )}
            </button>
            <button 
              onClick={onClose} 
              className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingCard = ({ booking, onViewDetails, onCancel }) => {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelClick = async () => {
    if (confirmCancel) {
      setIsCancelling(true);
      try {
        await onCancel(booking._id);
      } catch (error) {
        console.error('Error cancelling booking:', error);
      } finally {
        setIsCancelling(false);
      }
    } else {
      setConfirmCancel(true);
      setTimeout(() => setConfirmCancel(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
            ID: {booking.bookingId}
          </span>
          <span className="text-xl font-bold text-green-600">{formatCurrency(booking.price)}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center text-gray-700">
          <LocationIcon />
          <p><span className="font-semibold">{booking.pickupP}</span> to <span className="font-semibold">{booking.dropP}</span></p>
        </div>
        
        <div className="flex items-center text-gray-700">
          <CalendarIcon />
          <p>{formatDate(booking.pickupD)}</p>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-600">Vehicle</p>
            <p className="font-semibold text-gray-800">{booking.vehicleType} - {booking.vehicleNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Seats</p>
            <p className="font-semibold text-gray-800">{booking.seats?.length || 0} Booked</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 flex items-center justify-between border-t border-gray-100">
        <button
          onClick={() => onViewDetails(booking)}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
        >
          View & Modify
        </button>
        <button
          onClick={handleCancelClick}
          disabled={isCancelling}
          className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
            confirmCancel 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          } ${isCancelling ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isCancelling ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Cancelling...
            </>
          ) : (
            confirmCancel ? 'Confirm Cancel?' : 'Cancel Booking'
          )}
        </button>
      </div>
    </div>
  );
};

export default function MyRideBooking() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    if (!userId) {
      setError('User ID not found. Please login again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/travel/get-bookings-by/owner/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
   
    
        const processedData = (data || []).map(booking => ({
          ...booking,
          seats: booking.seats || []
        }));
        setBookings(processedData);
      
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  const handleUpdateBooking = async (updatedBooking) => {
    try {
      const response = await fetch(`${baseUrl}/travel/update-booking/${updatedBooking._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seats: updatedBooking.seats,
          price: updatedBooking.price,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setBookings(bookings.map(b => b._id === updatedBooking._id ? updatedBooking : b));
      } else {
        throw new Error(result.message || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`${baseUrl}/travel/cancel-booking/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setBookings(bookings.filter(b => b._id !== bookingId));
      } else {
        throw new Error(result.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  };

  const handleRetry = () => {
    fetchBookings();
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-800">My Bookings</h4>
              <p className="text-gray-600 mt-2">Manage your upcoming trips and view booking details.</p>
            </div>
            <button
              onClick={handleRetry}
              disabled={loading}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <RefreshIcon />
              <span className="ml-2">Refresh</span>
            </button>
          </div>
        </header>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={handleRetry} />
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookings.map(booking => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onViewDetails={handleViewDetails}
                onCancel={handleCancelBooking}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <CalendarIcon />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">No Bookings Found</h2>
            <p className="text-gray-500 mb-6">You currently have no active bookings. Start planning your next trip!</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-200"
            >
              <RefreshIcon />
              <span className="ml-2">Refresh Bookings</span>
            </button>
          </div>
        )}
      </div>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={handleCloseModal}
          onUpdate={handleUpdateBooking}
          allBookings={bookings}
        />
      )}
    </div>
  );
}
