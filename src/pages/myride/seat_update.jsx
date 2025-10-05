import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaIndianRupeeSign, FaChair, FaSpinner } from "react-icons/fa6";
import { XMarkIcon, PlusIcon, TrashIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { baseUrl } from "../../../baseUrl";

const SeatConfigUpdate = ({ open, onClose, car }) => {
  const [localSeatConfig, setLocalSeatConfig] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const abortControllerRef = useRef(null);

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
      setLocalSeatConfig([{
        seatType: "AC",
        seatNumber: 1,
        seatPrice: 0,
        isBooked: false,
        bookedBy: "",
      }]);
    }
    
    if (open) {
      setError("");
      setSuccess("");
    }
  }, [open, car]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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

      if (field === "isBooked" && !sanitizedValue) {
        seat.bookedBy = "";
      }

      updatedConfig[index] = seat;
      return updatedConfig;
    });
    
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
      setError("At least one seat is required");
      return;
    }
    setLocalSeatConfig((prev) => prev.filter((_, i) => i !== index));
  }, [localSeatConfig.length]);

  const validateSeatConfig = useCallback(() => {
    if (localSeatConfig.length === 0) {
      return "At least one seat is required";
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
    if (loading) return;
    onClose();
  }, [loading, onClose]);

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
  const totalRevenue = localSeatConfig.reduce((sum, seat) => sum + (seat.isBooked ? seat.seatPrice : 0), 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-2 sm:p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-4 py-3">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <FaChair className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Seat Configuration</h2>
                <p className="text-indigo-100 text-xs">Manage seat availability and pricing</p>
              </div>
            </div>
            <button 
              onClick={handleClose} 
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{localSeatConfig.length}</p>
                  <p className="text-xs text-gray-600 font-medium">Total Seats</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaChair className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-green-700">{availableCount}</p>
                  <p className="text-xs text-green-600 font-medium">Available</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-red-700">{bookedCount}</p>
                  <p className="text-xs text-red-600 font-medium">Booked</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg sm:text-xl font-bold text-emerald-700">₹{totalRevenue}</p>
                  <p className="text-xs text-emerald-600 font-medium">Revenue</p>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FaIndianRupeeSign className="w-3 h-3 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {(error || success) && (
          <div className="px-4 py-2 border-b border-gray-200">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
          <div className="space-y-3 sm:space-y-4">
            {localSeatConfig.map((seat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${seat.isBooked ? 'bg-red-100' : 'bg-green-100'}`}>
                        <FaChair className={`w-5 h-5 ${seat.isBooked ? 'text-red-600' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-800">Seat {seat.seatNumber || index + 1}</h3>
                        <p className="text-xs text-gray-600">{seat.seatType} • {seat.isBooked ? 'Booked' : 'Available'}</p>
                      </div>
                    </div>
                    <button
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-lg transition-all duration-200 disabled:opacity-50"
                      onClick={() => removeSeat(index)}
                      disabled={loading || localSeatConfig.length <= 1}
                      aria-label={`Remove seat ${index + 1}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">Remove</span>
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">Seat Type</label>
                      <select
                        value={seat.seatType}
                        onChange={(e) => handleSeatChange(index, "seatType", e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 bg-white shadow-sm"
                      >
                        <option value="AC">AC</option>
                        <option value="Non-AC">Non-AC</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">Seat Number</label>
                      <input
                        type="number"
                        min="1"
                        value={seat.seatNumber || ""}
                        onChange={(e) => handleSeatChange(index, "seatNumber", e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 shadow-sm"
                        placeholder="Seat number"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">Price</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaIndianRupeeSign className="text-gray-400" size={12} />
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={seat.seatPrice || ""}
                          onChange={(e) => handleSeatChange(index, "seatPrice", e.target.value)}
                          disabled={loading}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 shadow-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">Status</label>
                      <select
                        value={seat.isBooked}
                        onChange={(e) => handleSeatChange(index, "isBooked", e.target.value === "true")}
                        disabled={loading}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 bg-white shadow-sm"
                      >
                        <option value={false}>Available</option>
                        <option value={true}>Booked</option>
                      </select>
                    </div>

                    {seat.isBooked && (
                      <div className="col-span-2 lg:col-span-4 space-y-1">
                        <label className="block text-xs font-medium text-gray-600">Booked By</label>
                        <input
                          type="text"
                          value={seat.bookedBy || ""}
                          onChange={(e) => handleSeatChange(index, "bookedBy", e.target.value)}
                          disabled={loading}
                          maxLength={100}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 shadow-sm"
                          placeholder="Customer name or booking reference"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {localSeatConfig.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FaChair className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-1">No seats configured</h3>
                <p className="text-sm text-gray-500">Add a seat to get started.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <button 
              onClick={addNewSeat} 
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 hover:border-indigo-500 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
            >
              <PlusIcon className="w-5 h-5" />
              Add New Seat
            </button>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={handleClose} 
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || localSeatConfig.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin w-5 h-5" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatConfigUpdate;
