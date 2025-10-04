import { useEffect, useState } from "react";
import { userId } from "../../../util/configs";
import { baseUrl } from "../../../baseUrl";
import SeatConfigUpdate from "./seat_update";
import CarUpdate from "./car_details_update";

// ----------------- Revenue Chart -----------------
const RevenueBarChart = ({ data }) => {
  return (
    <div className="h-48 sm:h-64 flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 sm:p-4">
      <div className="text-center">
        <div className="flex space-x-4 sm:space-x-8 items-end justify-center h-28 sm:h-32">
          <div className="flex flex-col items-center">
            <div
              className="bg-blue-500 rounded-t-lg w-8 sm:w-12 transition-all duration-1000 ease-out"
              style={{
                height: `${
                  Math.max(data.Shared, data.Private) > 0
                    ? (data.Shared / Math.max(data.Shared, data.Private)) * 100
                    : 0
                }px`,
              }}
            ></div>
            <p className="text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium">
              Shared
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600">
              ₹{data.Shared.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="bg-green-500 rounded-t-lg w-8 sm:w-12 transition-all duration-1000 ease-out delay-200"
              style={{
                height: `${
                  Math.max(data.Shared, data.Private) > 0
                    ? (data.Private / Math.max(data.Shared, data.Private)) * 100
                    : 0
                }px`,
              }}
            ></div>
            <p className="text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium">
              Private
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600">
              ₹{data.Private.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------- Seat Type Pie -----------------
const SeatTypePieChart = ({ data }) => {
  const total = data.AC + data.NonAC;
  const acPercentage = total > 0 ? (data.AC / total) * 100 : 0;
  const nonAcPercentage = total > 0 ? (data.NonAC / total) * 100 : 0;

  return (
    <div className="h-48 sm:h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4">
          <svg
            className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90"
            viewBox="0 0 36 36"
          >
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray={`${acPercentage}, 100`}
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              strokeDasharray={`${nonAcPercentage}, 100`}
              strokeDashoffset={-acPercentage}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm sm:text-lg font-bold text-gray-900">
                ₹{total.toLocaleString()}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-600">Total</div>
            </div>
          </div>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs sm:text-sm">
              AC: {acPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-orange-500 rounded-full"></div>
            <span className="text-xs sm:text-sm">
              Non-AC: {nonAcPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------- Monthly Trend -----------------
const MonthlyTrendChart = ({ data }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="h-48 sm:h-64 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full">
        <div className="flex items-end justify-between h-28 sm:h-32 border-b-2 border-gray-200">
          {data.map((point, index) => (
            <div
              key={index}
              className="flex flex-col items-center flex-1 mx-0.5 sm:mx-1"
            >
              <div className="relative flex-1 flex flex-col justify-end">
                <div
                  className="bg-purple-500 rounded-t-lg w-6 sm:w-8 transition-all duration-1000 ease-out"
                  style={{
                    height: `${
                      maxRevenue > 0
                        ? (point.revenue / maxRevenue) * 100
                        : 0
                    }px`,
                    animationDelay: `${index * 200}ms`,
                  }}
                ></div>
              </div>
              <p className="text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium text-gray-700">
                {point.month.split(" ")[0]}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500">
                ₹{point.revenue.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-2 sm:mt-4 text-center">
          <p className="text-xs sm:text-sm text-green-600 font-medium">
            📈 Growth{" "}
            {data.length > 1
              ? (
                  ((data[data.length - 1].revenue - data[0].revenue) /
                    Math.max(data[0].revenue, 1)) *
                  100
                ).toFixed(1)
              : 0}
            %
          </p>
        </div>
      </div>
    </div>
  );
};

// ----------------- Chart Dashboard Wrapper -----------------
export const ChartDashboard = ({ revenueData }) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const sharingTypeRevenue =
    revenueData?.sharingTypeRevenue || { Shared: 0, Private: 0 };

  const chartData = {
    sharingType: sharingTypeRevenue,
    seatType: {
      AC: 9600,
      NonAC: 1800,
    },
    monthlyTrend: [
      { month: "July 2025", revenue: 8500 },
      { month: "August 2025", revenue: 10300 },
      { month: "September 2025", revenue: revenueData?.totalRevenue || 0 },
    ],
  };

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8 transition-all duration-500 ${
        animationComplete ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
          Revenue by Sharing Type
        </h3>
        <RevenueBarChart data={chartData.sharingType} />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
          Seat Type Preference
        </h3>
        <SeatTypePieChart data={chartData.seatType} />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow md:col-span-2 xl:col-span-1">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
          Monthly Revenue Trend
        </h3>
        <MonthlyTrendChart data={chartData.monthlyTrend} />
      </div>
    </div>
  );
}

export default function MyRide() {
  const [data, setData] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedCarForDetails, setSelectedCarForDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCarId, setEditingCarId] = useState(null);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isCarUpdateFormOpen, setIsCarUpdateFormOpen] = useState(false);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${baseUrl}/travel/get-a-car/by-owner/${userId}`
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setData(Array.isArray(result) ? result : []);
        setError("");
      } catch (error) {
        setError("Failed to load rides. Please try again.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchRides();
  }, []);

  const updateRunningStatus = async (carId, newStatus, newAvailability) => {
    try {
      const response = await fetch(`${baseUrl}/travel/update-a-car/${carId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runningStatus: newStatus,
          isAvailable: newAvailability,
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setData((prevData) =>
        prevData.map((car) =>
          car._id === carId
            ? { ...car, runningStatus: newStatus, isAvailable: newAvailability }
            : car
        )
      );
    } catch {
      setError("Failed to update vehicle status. Please try again.");
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const calculateRevenueData = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        totalRevenue: 0,
        totalBookedSeats: 0,
        totalAvailableSeats: 0,
        sharingTypeRevenue: { Shared: 0, Private: 0 },
      };
    }

    let totalRevenue = 0;
    let totalBookedSeats = 0;
    let totalAvailableSeats = 0;
    let sharingTypeRevenue = { Shared: 0, Private: 0 };

    data.forEach((ride) => {
      let rideRevenue = 0;

      if (ride.seatConfig && Array.isArray(ride.seatConfig)) {
        ride.seatConfig.forEach((seat) => {
          if (seat?.seatPrice) {
            if (seat.isBooked) {
              rideRevenue += seat.seatPrice;
              totalBookedSeats++;
            } else totalAvailableSeats++;
          }
        });
      } else if (ride.sharingType === "Private" && ride.price) {
        rideRevenue = ride.price;
      }

      totalRevenue += rideRevenue;
      if (ride.sharingType && sharingTypeRevenue.hasOwnProperty(ride.sharingType)) {
        sharingTypeRevenue[ride.sharingType] += rideRevenue;
      }
    });

    return {
      totalRevenue,
      totalBookedSeats,
      totalAvailableSeats,
      sharingTypeRevenue,
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status, isAvailable) => {
    if (status === "Available" && isAvailable)
      return (
        <span className="px-2 py-1 text-[10px] sm:text-xs rounded-full bg-green-100 text-green-700">
          ✅ Available
        </span>
      );
    if (status === "On A Trip")
      return (
        <span className="px-2 py-1 text-[10px] sm:text-xs rounded-full bg-blue-100 text-blue-700">
          🟡 On Trip
        </span>
      );
    return (
      <span className="px-2 py-1 text-[10px] sm:text-xs rounded-full bg-red-100 text-red-700">
        🔴 Unavailable
      </span>
    );
  };

  const getSharingTypeBadge = (sharingType) => {
    return sharingType === "Shared" ? (
      <span className="px-2 py-1 text-[10px] sm:text-xs rounded-full bg-purple-100 text-purple-700">
        Shared
      </span>
    ) : (
      <span className="px-2 py-1 text-[10px] sm:text-xs rounded-full bg-orange-100 text-orange-700">
        Private
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-b-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading your rides...</p>
        </div>
      </div>
    );
  }

  const openSeatUpdateForm = (carId) => {
    const carToEdit = data.find((car) => car._id === carId);
    if (carToEdit) {
      setSelectedCar(carToEdit);
      setEditingCarId(carId);
      setIsUpdateFormOpen(true);
    }
  };

  const openCarUpdateForm = (car) => {
    setSelectedCarForDetails(car);
    setIsCarUpdateFormOpen(true);
  };

  const handleUpdateSuccess = (updatedCar) => {
    setData((prevData) =>
      prevData.map((car) => (car._id === updatedCar._id ? updatedCar : car))
    );
    setIsCarUpdateFormOpen(false);
    setSelectedCarForDetails(null);
  };

  const closeUpdateForm = () => {
    setIsUpdateFormOpen(false);
    setSelectedCar(null);
    setEditingCarId(null);
  };

  const closeCarUpdateForm = () => {
    setIsCarUpdateFormOpen(false);
    setSelectedCarForDetails(null);
  };

  const revenueData = calculateRevenueData();

  return (
    <div className="min-h-screen bg-gray-50 pt-14 sm:pt-16">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
              My Rides Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Track your vehicles and revenue performance
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setSelectedTab("overview")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium ${
                selectedTab === "overview"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab("analytics")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium ${
                selectedTab === "analytics"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border">
            <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">
              ₹{revenueData.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border">
            <p className="text-xs sm:text-sm text-gray-600">Active Rides</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">
              {data.length}
            </p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border">
            <p className="text-xs sm:text-sm text-gray-600">Booked Seats</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">
              {revenueData.totalBookedSeats}
            </p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border">
            <p className="text-xs sm:text-sm text-gray-600">Avg/ Ride</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">
              ₹
              {data.length > 0
                ? Math.round(revenueData.totalRevenue / data.length)
                : 0}
            </p>
          </div>
        </div>

        {/* Charts */}
        {selectedTab === "analytics" && (
          <div className="mb-8">{/* <ChartDashboard revenueData={revenueData} /> */}</div>
        )}

        {/* Vehicle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {data.map((ride) => (
            <div
              key={ride._id}
              className="bg-white rounded-lg sm:rounded-xl shadow-md border overflow-hidden"
            >
              {/* Header */}
              <div className="h-40 sm:h-56 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <p className="text-sm sm:text-lg font-semibold">
                    {ride.make || "Vehicle"} {ride.model || ""}
                  </p>
                  <p className="text-xs sm:text-sm opacity-75">
                    {ride.vehicleNumber || "N/A"}
                  </p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 sm:gap-2">
                  {getStatusBadge(ride.runningStatus, ride.isAvailable)}
                  {getSharingTypeBadge(ride.sharingType)}
                </div>
              </div>

              {/* Details */}
              <div className="p-3 sm:p-6">
                <div className="mb-3 sm:mb-6 flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Departure
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {formatDate(ride.pickupD)}
                  </span>
                </div>
                <div className="mb-3 sm:mb-6 flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Arrival</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {formatDate(ride.dropD)}
                  </span>
                </div>

                {/* Pricing */}
                <div className="mb-3 sm:mb-6 p-2 sm:p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="font-medium">Base Price</span>
                    <span className="font-bold">₹{ride.price || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm mt-1">
                    <span className="font-medium">Per Person</span>
                    <span className="font-bold">₹{ride.perPersonCost || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => openCarUpdateForm(ride)}
                    className="flex-1 bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg text-xs sm:text-sm"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => openSeatUpdateForm(ride._id)}
                    className="flex-1 border border-gray-300 text-gray-700 px-3 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg text-xs sm:text-sm"
                  >
                    Edit Seats
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {isUpdateFormOpen && selectedCar && (
        <SeatConfigUpdate
          open={isUpdateFormOpen}
          onClose={closeUpdateForm}
          car={selectedCar}
          onUpdateSuccess={() => window.location.reload()}
        />
      )}

      {isCarUpdateFormOpen && selectedCarForDetails && (
        <CarUpdate
          open={isCarUpdateFormOpen}
          onClose={closeCarUpdateForm}
          car={selectedCarForDetails}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}