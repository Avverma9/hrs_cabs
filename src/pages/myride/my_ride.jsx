import { useEffect, useState } from "react";
import { userId } from "../../../util/configs";
import { baseUrl } from "../../../baseUrl";
import SeatConfigUpdate from "./seat_update";
import CarUpdate from "./car_details_update";

//no chnages
// Chart Components (You can replace these with your preferred charting library like Chart.js, Recharts, etc.)
const RevenueBarChart = ({ data }) => {
    return (
        <div className="h-64 flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-center">
                <div className="flex space-x-8 items-end justify-center h-32">
                    <div className="flex flex-col items-center">
                        <div
                            className="bg-blue-500 rounded-t-lg w-12 transition-all duration-1000 ease-out"
                            style={{ height: `${Math.max(data.Shared, data.Private) > 0 ? (data.Shared / Math.max(data.Shared, data.Private)) * 100 : 0}px` }}
                        ></div>
                        <p className="text-xs mt-2 font-medium">Shared</p>
                        <p className="text-xs text-gray-600">₹{data.Shared.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div
                            className="bg-green-500 rounded-t-lg w-12 transition-all duration-1000 ease-out delay-200"
                            style={{ height: `${Math.max(data.Shared, data.Private) > 0 ? (data.Private / Math.max(data.Shared, data.Private)) * 100 : 0}px` }}
                        ></div>
                        <p className="text-xs mt-2 font-medium">Private</p>
                        <p className="text-xs text-gray-600">₹{data.Private.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SeatTypePieChart = ({ data }) => {
    const total = data.AC + data.NonAC;
    const acPercentage = total > 0 ? (data.AC / total) * 100 : 0;
    const nonAcPercentage = total > 0 ? (data.NonAC / total) * 100 : 0;

    return (
        <div className="h-64 flex items-center justify-center">
            <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
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
                            <div className="text-lg font-bold text-gray-900">₹{total.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">Total</div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">AC: {acPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Non-AC: {nonAcPercentage.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MonthlyTrendChart = ({ data }) => {
    const maxRevenue = Math.max(...data.map(d => d.revenue));

    return (
        <div className="h-64 flex items-center justify-center p-4">
            <div className="w-full">
                <div className="flex items-end justify-between h-32 border-b-2 border-gray-200">
                    {data.map((point, index) => (
                        <div key={index} className="flex flex-col items-center flex-1 mx-1">
                            <div className="relative flex-1 flex flex-col justify-end">
                                <div
                                    className="bg-purple-500 rounded-t-lg w-6 sm:w-8 transition-all duration-1000 ease-out"
                                    style={{
                                        height: `${maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0}px`,
                                        animationDelay: `${index * 200}ms`
                                    }}
                                ></div>
                            </div>
                            <p className="text-xs mt-2 font-medium text-gray-700">{point.month.split(' ')[0]}</p>
                            <p className="text-xs text-gray-500">₹{point.revenue.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-center">
                    <p className="text-sm text-green-600 font-medium">
                        📈 Revenue growing by {data.length > 1 ? ((data[data.length - 1].revenue - data[0].revenue) / Math.max(data[0].revenue, 1) * 100).toFixed(1) : 0}%
                    </p>
                </div>
            </div>
        </div>
    );
};

export const ChartDashboard = ({ revenueData }) => {
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimationComplete(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const sharingTypeRevenue = revenueData?.sharingTypeRevenue || { Shared: 0, Private: 0 };

    const chartData = {
        sharingType: sharingTypeRevenue,
        seatType: {
            AC: 9600,
            NonAC: 1800
        },
        monthlyTrend: [
            { month: "July 2025", revenue: 8500 },
            { month: "August 2025", revenue: 10300 },
            { month: "September 2025", revenue: revenueData?.totalRevenue || 0 }
        ]
    };

    return (
        <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-8 transition-all duration-500 ${animationComplete ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Revenue by Sharing Type</h3>
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                </div>
                <RevenueBarChart data={chartData.sharingType} />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Seat Type Preference</h3>
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                    </div>
                </div>
                <SeatTypePieChart data={chartData.seatType} />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-shadow lg:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Trend</h3>
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                </div>
                <MonthlyTrendChart data={chartData.monthlyTrend} />
            </div>
        </div>
    );
};


export default function MyRide() {
    const [data, setData] = useState([]);
    const [successAlert, setSuccessAlert] = useState("");
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [showSeatPopup, setShowSeatPopup] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);
    const [selectedCarForDetails, setSelectedCarForDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingCarId, setEditingCarId] = useState(null);
    const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [isCarUpdateFormOpen, setIsCarUpdateFormOpen] = useState(false);

    const fetchRides = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${baseUrl}/travel/get-a-car/by-owner/${userId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            setData(Array.isArray(result) ? result : []);
            setError("");
        } catch (error) {
            console.error('Error fetching rides:', error);
            setError("Failed to load rides. Please try again.");
            setData([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (userId) fetchRides();
    }, [userId]);

    const updateRunningStatus = async (carId, newStatus, newAvailability) => {
        try {
            const response = await fetch(`${baseUrl}/travel/update-a-car/${carId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ runningStatus: newStatus, isAvailable: newAvailability }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update status');
            }
            setData(prevData => prevData.map(car => car._id === carId ? { ...car, runningStatus: newStatus, isAvailable: newAvailability } : car));
        } catch (error) {
            console.error('Error updating running status:', error);
            setError("Failed to update vehicle status. Please try again.");
            setTimeout(() => window.location.reload(), 2000);
        }
    };

    const calculateRevenueData = () => {
        if (!Array.isArray(data) || data.length === 0) {
            return { totalRevenue: 0, totalBookedSeats: 0, totalAvailableSeats: 0, routeRevenue: {}, vehicleTypeRevenue: {}, sharingTypeRevenue: { "Shared": 0, "Private": 0 } };
        }
        let totalRevenue = 0, totalBookedSeats = 0, totalAvailableSeats = 0, routeRevenue = {}, vehicleTypeRevenue = {}, sharingTypeRevenue = { "Shared": 0, "Private": 0 };
        data.forEach(ride => {
            if (!ride) return;
            let rideRevenue = 0;
            if (ride.seatConfig && Array.isArray(ride.seatConfig) && ride.seatConfig.length > 0) {
                ride.seatConfig.forEach(seat => {
                    if (seat && typeof seat.seatPrice === 'number') {
                        if (seat.isBooked) { rideRevenue += seat.seatPrice; totalBookedSeats++; } else { totalAvailableSeats++; }
                    }
                });
            } else if (ride.sharingType === "Private" && typeof ride.price === 'number') { rideRevenue = ride.price; }
            totalRevenue += rideRevenue;
            if (ride.pickupP && ride.dropP) { const route = `${ride.pickupP} → ${ride.dropP}`; routeRevenue[route] = (routeRevenue[route] || 0) + rideRevenue; }
            if (ride.make && ride.model) { const vehicleType = `${ride.make} ${ride.model}`; vehicleTypeRevenue[vehicleType] = (vehicleTypeRevenue[vehicleType] || 0) + rideRevenue; }
            if (ride.sharingType && sharingTypeRevenue.hasOwnProperty(ride.sharingType)) { sharingTypeRevenue[ride.sharingType] += rideRevenue; }
        });
        return { totalRevenue, totalBookedSeats, totalAvailableSeats, routeRevenue, vehicleTypeRevenue, sharingTypeRevenue };
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not specified";
        try { return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (error) { return "Invalid date"; }
    };
    
    const getStatusBadge = (status, isAvailable) => {
        if (status === "Available" && isAvailable) return (<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>Available</span>);
        if (status === "On A Trip") return (<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>On Trip</span>);
        return (<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>Unavailable</span>);
    };

    const getSharingTypeBadge = (sharingType) => sharingType === "Shared" ? (<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"><svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" /></svg>Shared</span>) : (<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200"><svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>Private</span>);

    if (loading) return (<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600 font-medium">Loading your rides...</p></div></div>);
    
    const openSeatUpdateForm = (carId) => { const carToEdit = data.find(car => car._id === carId); if (carToEdit) { setSelectedCar(carToEdit); setEditingCarId(carId); setIsUpdateFormOpen(true); } };
    const handleSeatClick = (seat) => {
        if (seat.isBooked && seat.bookedBy) {
            setSelectedSeat(seat);
            setShowSeatPopup(true);
        }
    };
    const closeSeatPopup = () => {
        setShowSeatPopup(false);
        setSelectedSeat(null);
    };
    const openCarUpdateForm = (car) => { setSelectedCarForDetails(car); setIsCarUpdateFormOpen(true); };
    const handleUpdateSuccess = (updatedCar) => {
        setSuccessAlert("Update successful!");
        setIsCarUpdateFormOpen(false);
        setSelectedCarForDetails(null);
        fetchRides();
        setTimeout(() => setSuccessAlert(""), 2000);
    };
    const closeUpdateForm = () => { setIsUpdateFormOpen(false); setSelectedCar(null); setEditingCarId(null); };
    const handleSeatUpdateSuccess = () => {
        setSuccessAlert("Update successful!");
        closeUpdateForm();
        fetchRides();
        setTimeout(() => setSuccessAlert(""), 2000);
    };
    const closeCarUpdateForm = () => { setIsCarUpdateFormOpen(false); setSelectedCarForDetails(null); };

    const revenueData = calculateRevenueData();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16">
            {successAlert && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-center font-semibold transition-all">
                    {successAlert}
                </div>
            )}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Rides Dashboard</h1>
                            <p className="text-gray-600 mt-1">Track your vehicles, bookings, and revenue</p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <div className="flex rounded-lg bg-gray-100 p-1">
                                <button onClick={() => setSelectedTab('overview')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Overview</button>
                                <button onClick={() => setSelectedTab('analytics')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedTab === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Analytics</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start"><div className="flex-shrink-0"><svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></div><div className="ml-3"><p className="text-sm text-red-800">{error}</p></div></div>)}
                
                {/* Stats Grid - Already responsive */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    {/* Stat Cards... */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200"><div className="flex items-center"><div className="p-3 bg-green-500 rounded-lg"><svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-gray-600">Total Revenue</p><p className="text-xl sm:text-2xl font-bold text-gray-900">₹{revenueData.totalRevenue.toLocaleString()}</p></div></div></div>
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200"><div className="flex items-center"><div className="p-3 bg-blue-500 rounded-lg"><svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-gray-600">Active Rides</p><p className="text-xl sm:text-2xl font-bold text-gray-900">{data.length}</p></div></div></div>
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200"><div className="flex items-center"><div className="p-3 bg-purple-500 rounded-lg"><svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-gray-600">Booked Seats</p><p className="text-xl sm:text-2xl font-bold text-gray-900">{revenueData.totalBookedSeats}</p></div></div></div>
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200"><div className="flex items-center"><div className="p-3 bg-orange-500 rounded-lg"><svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-gray-600">Avg. Revenue</p><p className="text-xl sm:text-2xl font-bold text-gray-900">₹{data.length > 0 ? Math.round(revenueData.totalRevenue / data.length).toLocaleString() : 0}</p></div></div></div>
                </div>

                {selectedTab === 'analytics' && <ChartDashboard revenueData={revenueData} />}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Vehicles</h2>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-4"><div className="flex items-center"><span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span><span className="text-sm text-gray-600">Available</span></div><div className="flex items-center"><span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span><span className="text-sm text-gray-600">On Trip</span></div></div>
                </div>

                {data.length === 0 ? (
                    <div className="text-center py-16"><div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4"><svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></div><h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3><p className="text-gray-500 mb-6">Get started by adding your first ride.</p><button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">Add New Ride</button></div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                        {data.map((ride) => (
                            <div key={ride._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
                                {/* Vehicle Header Image */}
                                <div className="h-48 sm:h-56 relative overflow-hidden">
                                    {ride.images && Array.isArray(ride.images) && ride.images.length > 0 ? (
                                        <img src={ride.images[0]} alt={`${ride.make || 'Vehicle'} ${ride.model || ''}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML = `<div class="h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-center p-4"><div class="opacity-90"><svg class="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-5a2 2 0 00-2-2H8z"></path></svg><p class="font-medium text-base sm:text-lg">${ride.make || 'Vehicle'}</p><p class="text-xs sm:text-sm">${ride.model || ''}</p></div></div>`; }} />
                                    ) : (
                                        <div className="h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-center p-4"><div class="opacity-90"><svg class="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-5a2 2 0 00-2-2H8z"></path></svg><p class="font-medium text-base sm:text-lg">${ride.make || 'Vehicle'}</p><p class="text-xs sm:text-sm">${ride.model || ''}</p></div></div>
                                    )}
                                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col sm:flex-row gap-2">
                                        {getStatusBadge(ride.runningStatus, ride.isAvailable)}
                                        {getSharingTypeBadge(ride.sharingType)}
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6 lg:p-8">
                                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h6 className="text-xl font-bold text-gray-900 mb-1">{ride.make || 'Unknown'} {ride.model || 'Vehicle'}</h6>
                                            <div className="flex items-center text-gray-600"><svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg><span className="font-medium text-base">{ride.vehicleNumber || 'N/A'}</span></div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                            <select value={ride.isAvailable} onChange={(e) => updateRunningStatus(ride._id, ride.runningStatus, e.target.value === "true")} className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg shadow-sm border focus:outline-none focus:ring-2 transition-colors ${ride.isAvailable ? "bg-green-100 text-green-700 border-green-300 focus:ring-green-400" : "bg-red-100 text-red-700 border-red-300 focus:ring-red-400"}`}><option value={true}>✅ Available</option><option value={false}>❌ Unavailable</option></select>
                                            <select value={ride.runningStatus || "Available"} onChange={(e) => updateRunningStatus(ride._id, e.target.value, ride.isAvailable)} className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg shadow-sm border focus:outline-none focus:ring-2 transition-colors ${ride.runningStatus === "On A Trip" ? "bg-blue-100 text-blue-700 border-blue-300 focus:ring-blue-400" : "bg-green-100 text-green-700 border-green-300 focus:ring-green-400"}`}><option value="Available">🟢 Available</option><option value="On A Trip">🟡 On Trip</option><option value="Unavailable">🔴 Unavailable</option></select>
                                        </div>
                                    </div>

                                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                        {/* Route information... */}
                                        <div className="flex items-center justify-between mb-3"><div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span className="ml-2 font-semibold text-gray-900 truncate pr-2">{ride.pickupP || 'Unknown'}</span></div><div className="flex-1 mx-2"><div className="border-t-2 border-dashed border-gray-300"></div></div><div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="ml-2 font-semibold text-gray-900 truncate pl-2">{ride.dropP || 'Unknown'}</span></div></div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm"><div className="text-center sm:text-left"><span className="text-gray-500 block">Departure</span><span className="font-medium text-gray-900">{formatDate(ride.pickupD)}</span></div><div className="text-center sm:text-right"><span className="text-gray-500 block">Arrival</span><span className="font-medium text-gray-900">{formatDate(ride.dropD)}</span></div></div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6 text-sm">
                                        {/* Specs details... */}
                                        <div className="flex justify-between items-center"><span className="text-gray-600">Year</span><span className="font-semibold text-gray-900">{ride.year || 'N/A'}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-gray-600">Fuel Type</span><span className="font-semibold text-gray-900">{ride.fuelType || 'N/A'}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-gray-600">Seater</span><span className="font-semibold text-gray-900">{ride.seater || 'N/A'} seater</span></div>
                                        <div className="flex justify-between items-center"><span className="text-gray-600">Transmission</span><span className="font-semibold text-gray-900">{ride.transmission || 'N/A'}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-gray-600">Color</span><div className="flex items-center"><div className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: ride.color?.toLowerCase() || '#gray' }}></div><span className="font-semibold text-gray-900">{ride.color || 'N/A'}</span></div></div>
                                        <div className="flex justify-between items-center"><span className="text-gray-600">Mileage</span><span className="font-semibold text-gray-900">{ride.mileage || 'N/A'} km/l</span></div>
                                    </div>

                                    {ride.sharingType === "Shared" && ride.seatConfig && Array.isArray(ride.seatConfig) && ride.seatConfig.length > 0 && (
                                        <div className="mb-6">
                                            <div className="flex justify-between items-center mb-3"><h4 className="font-semibold text-gray-900">Seat Configuration</h4><div className="text-sm text-gray-600">{ride.seatConfig.filter(seat => seat.isBooked).length}/{ride.seatConfig.length} Booked</div></div>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                                                {ride.seatConfig.map((seat) => (
                                                    <div
                                                        key={seat._id}
                                                        className={`relative p-2 rounded-lg border-2 text-center transition-all cursor-pointer ${seat.isBooked ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'}`}
                                                        onClick={() => handleSeatClick(seat)}
                                                    >
                                                        <div className="font-bold text-base sm:text-lg">{seat.seatNumber}</div>
                                                        <div className="text-xs font-medium">{seat.seatType}</div>
                                                        <div className="text-xs font-bold">₹{seat.seatPrice}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100"><div className="flex justify-between items-center mb-1"><span className="font-medium text-blue-900">Ride Revenue</span><span className="text-lg sm:text-xl font-bold text-blue-600">₹{ride.seatConfig.reduce((total, seat) => seat.isBooked ? total + (seat.seatPrice || 0) : total, 0)}</span></div><div className="text-xs sm:text-sm text-blue-700">Occupancy: {Math.round((ride.seatConfig.filter(s => s.isBooked).length / ride.seatConfig.length) * 100)}%</div></div>
                                        </div>
                                    )}
            {/* Seat Details Popup */}
            {showSeatPopup && selectedSeat && (
                <div className="fixed inset-0 bg-gray-1000 bg-opacity-20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs w-full mx-2 relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg font-bold"
                            onClick={closeSeatPopup}
                            aria-label="Close"
                        >×</button>
                        <h3 className="text-lg font-bold text-indigo-700 mb-4 text-center">Seat Details</h3>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-semibold text-gray-700">Seat Number:</span> {selectedSeat.seatNumber}</div>
                            <div><span className="font-semibold text-gray-700">Type:</span> {selectedSeat.seatType}</div>
                            <div><span className="font-semibold text-gray-700">Price:</span> ₹{selectedSeat.seatPrice}</div>
                            <div><span className="font-semibold text-gray-700">Booked:</span> {selectedSeat.isBooked ? 'Yes' : 'No'}</div>
                            {selectedSeat.isBooked && (
                                <div><span className="font-semibold text-gray-700">Booked By:</span> {selectedSeat.bookedBy || 'N/A'}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

                                    <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-4 border-t border-gray-100">
                                        <button onClick={() => openCarUpdateForm(ride)} className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>Edit Details</button>
                                        <button onClick={() => openSeatUpdateForm(ride._id)} className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium flex items-center justify-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>Edit Seats</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isUpdateFormOpen && selectedCar && <SeatConfigUpdate open={isUpdateFormOpen} onClose={closeUpdateForm} car={selectedCar} onUpdateSuccess={handleSeatUpdateSuccess} />}
                {isCarUpdateFormOpen && selectedCarForDetails && <CarUpdate open={isCarUpdateFormOpen} onClose={closeCarUpdateForm} car={selectedCarForDetails} onUpdateSuccess={handleUpdateSuccess} />}
            </div>
        </div>
    );
}
