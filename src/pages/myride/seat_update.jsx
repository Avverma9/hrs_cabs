// SeatConfigUpdate.js (Improved और Bug-Free Version)
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaIndianRupeeSign, FaChair, FaSpinner } from "react-icons/fa6";
import { XMarkIcon, PlusIcon, TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { baseUrl } from "../../../baseUrl";

const SeatConfigUpdate = ({ open, onClose, car }) => {
  const [localSeatConfig, setLocalSeatConfig] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const abortControllerRef = useRef(null);

  // Initialize seat config with proper validation
  useEffect(() => {
    if (open && car?.seatConfig && Array.isArray(car.seatConfig)) {
      setLocalSeatConfig(car.seatConfig.map((seat, index) => ({
        seatType: seat.seatType || "AC",
        seatNumber: typeof seat.seatNumber === 'number' ? seat.seatNumber : index + 1,
        seatPrice: typeof seat.seatPrice === 'number' ? seat.seatPrice : 0,
        isBooked: Boolean(seat.isBooked),
        bookedBy: seat.bookedBy || "",
      })));
    } else if (open) {
      // Initialize with default seat if no config exists
      setLocalSeatConfig([{
        seatType: "AC",
        seatNumber: 1,
        seatPrice: 0,
        isBooked: false,
        bookedBy: "",
      }]);
    }
    
    // Clear messages when modal opens
    if (open) {
      setError("");
      setSuccess("");
    }
  }, [open, car]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Validate and sanitize input values
  const sanitizeValue = useCallback((field, value) => {
    switch (field) {
      case "seatNumber":
      case "seatPrice":
        { const num = Number(value);
        return isNaN(num) || num < 0 ? 0 : Math.floor(num); }
      case "seatType":
        return ["AC", "Non-AC"].includes(value) ? value : "AC";
      case "bookedBy":
        return typeof value === 'string' ? value.trim().slice(0, 100) : "";
      case "isBooked":
        return Boolean(value);
      default:
        return value;
    }
  }, []);

  const handleSeatChange = useCallback((index, field, value) => {
    setLocalSeatConfig((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      
      const updatedConfig = [...prev];
      const seat = { ...updatedConfig[index] };
      const sanitizedValue = sanitizeValue(field, value);

      seat[field] = sanitizedValue;

      // Clear bookedBy if seat becomes available
      if (field === "isBooked" && !sanitizedValue) {
        seat.bookedBy = "";
      }

      updatedConfig[index] = seat;
      return updatedConfig;
    });
    
    // Clear error when user makes changes
    if (error) setError("");
  }, [sanitizeValue, error]);

  const getNextSeatNumber = useCallback(() => {
    const existingNumbers = localSeatConfig.map(seat => seat.seatNumber);
    let nextNumber = 1;
    while (existingNumbers.includes(nextNumber)) {
      nextNumber++;
    }
    return nextNumber;
  }, [localSeatConfig]);

  const addNewSeat = useCallback(() => {
    setLocalSeatConfig((prev) => [
      ...prev,
      {
        seatType: "AC",
        seatNumber: getNextSeatNumber(),
        seatPrice: 0,
        isBooked: false,
        bookedBy: "",
      },
    ]);
  }, [getNextSeatNumber]);

  const removeSeat = useCallback((index) => {
    if (localSeatConfig.length <= 1) {
      setError("कम से कम एक सीट होनी चाहिए");
      return;
    }
    setLocalSeatConfig((prev) => prev.filter((_, i) => i !== index));
  }, [localSeatConfig.length]);

  const validateSeatConfig = useCallback(() => {
    if (localSeatConfig.length === 0) {
      return "कम से कम एक सीट होनी चाहिए";
    }

    const seatNumbers = localSeatConfig.map(seat => seat.seatNumber);
    const duplicates = seatNumbers.filter((num, index) => seatNumbers.indexOf(num) !== index);
    
    if (duplicates.length > 0) {
      return `Duplicate seat numbers found: ${duplicates.join(", ")}`;
    }

    for (let i = 0; i < localSeatConfig.length; i++) {
      const seat = localSeatConfig[i];
      if (!seat.seatNumber || seat.seatNumber <= 0) {
        return `Seat ${i + 1}: Invalid seat number`;
      }
      if (seat.seatPrice < 0) {
        return `Seat ${i + 1}: Price cannot be negative`;
      }
      if (seat.isBooked && !seat.bookedBy.trim()) {
        return `Seat ${i + 1}: Booked by field is required for booked seats`;
      }
    }

    return null;
  }, [localSeatConfig]);

  const handleSave = async () => {
    const validationError = validateSeatConfig();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!car?._id) {
      setError("Car ID not found");
      return;
    }

    setLoading(true);
    setError("");
    
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${baseUrl}/travel/update-a-car/${car._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seatConfig: localSeatConfig }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      setSuccess("Seat configuration updated successfully!");
      
      // Close modal after short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error saving seat config:", error);
        setError("Failed to save seat configuration. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (loading) return; // Prevent closing during save
    onClose();
  }, [loading, onClose]);

  // Keyboard event handling
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !loading) {
      handleClose();
    }
  }, [handleClose, loading]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const bookedCount = localSeatConfig.filter((s) => s.isBooked).length;
  const availableCount = localSeatConfig.length - bookedCount;

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Seat Configuration</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage seat availability and pricing</p>
          </div>
          <button 
            onClick={handleClose} 
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-2 sm:gap-4 px-3 sm:px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border shadow-sm">
            <FaChair className="text-gray-600" />
            <span className="text-sm font-medium">Total: {localSeatConfig.length}</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg">
            <FaChair />
            <span className="text-sm font-medium">Available: {availableCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
            <FaChair />
            <span className="text-sm font-medium">Booked: {bookedCount}</span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {(error || success) && (
          <div className="px-3 sm:px-6 py-3 border-b">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <FaChair className="flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 bg-gray-50">
          {localSeatConfig.map((seat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FaChair className="text-blue-600" />
                  Seat {seat.seatNumber || index + 1}
                </h3>
                <button
                  className="flex items-center gap-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                  onClick={() => removeSeat(index)}
                  disabled={loading || localSeatConfig.length <= 1}
                  aria-label={`Remove seat ${index + 1}`}
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={seat.seatType}
                    onChange={(e) => handleSeatChange(index, "seatType", e.target.value)}
                    disabled={loading}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                  >
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                  </select>
                </div>

                {/* Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seat Number</label>
                  <input
                    type="number"
                    min="1"
                    value={seat.seatNumber || ""}
                    onChange={(e) => handleSeatChange(index, "seatNumber", e.target.value)}
                    disabled={loading}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                    placeholder="Seat number"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaIndianRupeeSign className="text-gray-400" size={14} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={seat.seatPrice || ""}
                      onChange={(e) => handleSeatChange(index, "seatPrice", e.target.value)}
                      disabled={loading}
                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={seat.isBooked}
                    onChange={(e) => handleSeatChange(index, "isBooked", e.target.value === "true")}
                    disabled={loading}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                  >
                    <option value={false}>Available</option>
                    <option value={true}>Booked</option>
                  </select>
                </div>

                {/* Booked By (conditional) */}
                {seat.isBooked && (
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Booked By</label>
                    <input
                      type="text"
                      value={seat.bookedBy || ""}
                      onChange={(e) => handleSeatChange(index, "bookedBy", e.target.value)}
                      disabled={loading}
                      maxLength={100}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                      placeholder="Customer name or booking reference"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {localSeatConfig.length === 0 && (
            <div className="text-center py-12">
              <FaChair className="mx-auto text-gray-400 text-4xl mb-4" />
              <p className="text-gray-600">No seats configured. Add a seat to get started.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t px-3 sm:px-6 py-4 bg-gray-50">
          <button 
            onClick={addNewSeat} 
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-500 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-4 h-4" />
            Add New Seat
          </button>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleClose} 
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || localSeatConfig.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatConfigUpdate;