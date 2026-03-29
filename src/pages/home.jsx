import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllCars,
  filterCars,
  getCarById,
  getSeatData,
  clearCar,
  clearSeatData,
  clearCarSuccess,
} from '../redux/slices/carSlice';
import {
  createTravelBooking,
  clearBookingError,
  clearBookingSuccess,
} from '../redux/slices/bookingSlice';

// Sleek fallback image if API array is empty
const FALLBACK_IMG = "https://images.unsplash.com/photo-1503376760367-1db5e3067eb5?q=80&w=800&auto=format&fit=crop";

const PillInfo = ({ icon, text }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100/80 text-gray-700 rounded-full text-xs font-semibold backdrop-blur-sm border border-gray-200/50">
    <span className="opacity-70">{icon}</span>
    <span>{text}</span>
  </div>
);

const DetailCard = ({ label, value }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-center">
    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">{label}</span>
    <span className="text-sm font-black text-gray-800 line-clamp-1">{value || '-'}</span>
  </div>
);

export default function Home() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { cars, car, seatData, loading, error } = useSelector((s) => s.cars);
  const { loading: bLoading, error: bError, success: bSuccess, booking: bBooking } = useSelector((s) => s.bookings);

  const [filter, setFilter] = useState({
    pickupP: '', dropP: '', vehicleType: '', fuelType: '', seater: ''
  });

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [bookForm, setBookForm] = useState({
    passengerName: '', customerMobile: '', customerEmail: '', paymentMethod: 'Online',
  });

  useEffect(() => {
    dispatch(getAllCars());
    return () => {
      dispatch(clearCar()); dispatch(clearSeatData()); dispatch(clearBookingError()); dispatch(clearBookingSuccess()); dispatch(clearCarSuccess());
    };
  }, [dispatch]);

  const handleFilter = (e) => setFilter({ ...filter, [e.target.name]: e.target.value });

  const doFilter = () => {
    const clean = {};
    Object.entries(filter).forEach(([k, v]) => { if (v) clean[k] = v });
    if (Object.keys(clean).length) dispatch(filterCars(clean));
    else dispatch(getAllCars());
  };

  const openDetail = (id) => {
    dispatch(getCarById(id));
    dispatch(getSeatData(id));
    setSelectedSeats([]);
    setShowBookForm(false);
  };

  const closeDetail = () => {
    dispatch(clearCar());
    dispatch(clearSeatData());
    setSelectedSeats([]);
    dispatch(clearBookingError());
  };

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) => prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]);
  };

  const submitBooking = () => {
    if (!carObj) return;
    const data = {
      userId: user?.id || user?._id || localStorage.getItem('loggedUserId') || '',
      carId: carObj._id,
      ...bookForm,
      vehicleType: carObj.vehicleType,
      sharingType: carObj.sharingType,
    };
    if (carObj.sharingType === 'Shared') data.seats = selectedSeats;
    if (carObj.pickupD) data.pickupD = carObj.pickupD;
    if (carObj.dropD) data.dropD = carObj.dropD;
    dispatch(createTravelBooking(data));
  };

  const carObj = car?.car || car?.data || car;
  const seatsArray = seatData?.seats || carObj?.seatConfig || [];
  const mainImage = carObj?.images?.[0] || FALLBACK_IMG;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-24 md:pb-12 text-gray-900 selection:bg-black selection:text-white">
      
      {/* ── Modern Floating Search Bar ── */}
      <div className="sticky top-0 z-30 px-4 pt-4 pb-2 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-2 bg-white p-2 rounded-3xl md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <input name="pickupP" placeholder="Pickup City..." value={filter.pickupP} onChange={handleFilter} className="w-full bg-transparent px-4 py-3 md:py-2 outline-none font-medium text-gray-800 placeholder:text-gray-400 border-b md:border-b-0 md:border-r border-gray-100" />
          <input name="dropP" placeholder="Drop City..." value={filter.dropP} onChange={handleFilter} className="w-full bg-transparent px-4 py-3 md:py-2 outline-none font-medium text-gray-800 placeholder:text-gray-400 border-b md:border-b-0 md:border-r border-gray-100" />
          <select name="vehicleType" value={filter.vehicleType} onChange={handleFilter} className="w-full bg-transparent px-4 py-3 md:py-2 outline-none font-medium text-gray-600 border-b md:border-b-0 md:border-r border-gray-100 cursor-pointer">
            <option value="">Any Vehicle</option><option value="Car">Cars</option><option value="Bus">Buses</option>
          </select>
          <div className="flex gap-2">
            <button onClick={doFilter} className="flex-1 md:flex-none bg-black text-white px-8 py-3 md:py-2 rounded-2xl md:rounded-full font-bold hover:bg-gray-800 active:scale-95 transition-all whitespace-nowrap">
              Search
            </button>
            {(filter.pickupP || filter.dropP || filter.vehicleType) && (
              <button
                onClick={() => {
                  setFilter({ pickupP: '', dropP: '', vehicleType: '', fuelType: '', seater: '' })
                  dispatch(getAllCars())
                }}
                className="px-4 py-3 md:py-2 rounded-2xl md:rounded-full font-bold bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all whitespace-nowrap text-sm"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Explore Premium Rides</h1>
        <p className="text-gray-500 font-medium mb-8">Book private cars or shared buses for your next journey.</p>

        {loading && <div className="h-40 flex items-center justify-center font-bold text-gray-400 animate-pulse">Fetching best rides...</div>}
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-semibold mb-6 border border-red-100">{String(error)}</div>}

        {/* ── Image-First Card Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Array.isArray(cars) ? cars : []).map((c) => {
            const item = c?.car || c;
            const isShared = item.sharingType === 'Shared';
            const cardImg = item.images?.[0] || FALLBACK_IMG;

            return (
              <div key={item._id} className="group bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col" onClick={() => openDetail(item._id)}>
                
                {/* Image Section */}
                <div className="relative h-56 w-full rounded-[1.5rem] overflow-hidden mb-4 bg-gray-100">
                  <img src={cardImg} alt={item.make} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  
                  {/* Badges Over Image */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-md text-black px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                      {item.sharingType}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 flex gap-2">
                     <PillInfo icon="💺" text={`${item.seater} Seats`} />
                     <PillInfo icon="⛽" text={item.fuelType} />
                  </div>
                </div>

                {/* Content Section */}
                <div className="px-2 pb-2 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-black text-gray-900 truncate pr-2">{item.make} {item.model}</h3>
                      <div className="text-right">
                        <span className="text-2xl font-black tracking-tight">₹{isShared ? item.perPersonCost : item.price}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block -mt-1">{isShared ? '/Seat' : '/Trip'}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-500">{item.year} • {item.vehicleType} • {item.transmission}</p>
                  </div>

                  {/* Route Indicator */}
                  <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-2xl p-3 border border-gray-100">
                    <div className="flex flex-col flex-1 truncate pr-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">From</span>
                      <span className="text-sm font-bold text-gray-800 truncate">{item.pickupP || 'Any'}</span>
                    </div>
                    <div className="w-8 border-t-2 border-dashed border-gray-300 mx-2"></div>
                    <div className="flex flex-col flex-1 text-right truncate pl-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">To</span>
                      <span className="text-sm font-bold text-gray-800 truncate">{item.dropP || 'Any'}</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ── Immersive Details Modal (Bottom Sheet on Mobile) ── */}
      {carObj && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeDetail}>
          <div className="bg-[#F8F9FA] w-full md:w-[600px] lg:w-[800px] h-[92vh] md:h-[85vh] md:rounded-[2.5rem] rounded-t-[2.5rem] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full md:zoom-in-95 duration-300 relative" onClick={e => e.stopPropagation()}>
            
            {/* Hero Image Header inside Modal */}
            <div className="relative h-64 md:h-80 shrink-0 bg-black">
              <img src={mainImage} alt="Car" className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FA] via-transparent to-black/30"></div>
              
              <button onClick={closeDetail} className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white text-2xl transition-all z-10">
                ✕
              </button>

              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-3 py-1 bg-white text-black text-xs font-black uppercase tracking-wider rounded-full shadow-lg mb-3 inline-block">
                  {carObj.sharingType} Ride
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 drop-shadow-sm leading-none">{carObj.make} {carObj.model}</h2>
                <p className="text-gray-700 font-bold mt-2 flex items-center gap-2">
                   <span className="bg-gray-200/80 px-2 py-0.5 rounded uppercase text-xs">{carObj.vehicleNumber}</span>
                   {carObj.color} • {carObj.year}
                </p>
              </div>
            </div>

            {/* Scrollable Details Area */}
            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32 no-scrollbar">
              
              {/* Route & Timing Card */}
              <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                 <div className="w-full">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pickup</span>
                    <strong className="block text-lg text-gray-900">{carObj.pickupP || 'N/A'}</strong>
                    {carObj.pickupD && <span className="text-xs font-bold text-indigo-500">{new Date(carObj.pickupD).toLocaleString()}</span>}
                 </div>
                 <div className="hidden md:block w-full border-t-2 border-dashed border-gray-200 relative">
                    <div className="absolute left-1/2 -top-3 -translate-x-1/2 bg-white px-2 text-gray-300">➔</div>
                 </div>
                 <div className="w-full md:text-right">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Drop</span>
                    <strong className="block text-lg text-gray-900">{carObj.dropP || 'N/A'}</strong>
                    {carObj.dropD && <span className="text-xs font-bold text-indigo-500">{new Date(carObj.dropD).toLocaleString()}</span>}
                 </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <DetailCard label="Vehicle" value={carObj.vehicleType} />
                <DetailCard label="Transmission" value={carObj.transmission} />
                <DetailCard label="Fuel" value={carObj.fuelType} />
                <DetailCard label="Mileage" value={`${carObj.mileage} km/l`} />
                <DetailCard label="Capacity" value={`${carObj.seater} Seats`} />
                <DetailCard label="Extra KM Charge" value={`₹${carObj.extraKm || 0}`} />
                <DetailCard label="Status" value={carObj.runningStatus} />
                <DetailCard label="Listed On" value={new Date(carObj.dateAdded).toLocaleDateString()} />
              </div>

              {/* Dynamic Seat Map (If Shared) */}
              {carObj.sharingType === 'Shared' && seatsArray.length > 0 && (
                <div className="mb-8 bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-5">
                    <h4 className="text-lg font-black text-gray-900">Select Seats</h4>
                    <span className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-full">{selectedSeats.length} Selected</span>
                  </div>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {seatsArray.map((s) => {
                      const id = s._id || s.seatNumber;
                      const isSelected = selectedSeats.includes(id);
                      return (
                        <button
                          key={id} disabled={s.isBooked} onClick={() => toggleSeat(id)}
                          className={`relative pt-3 pb-2 flex flex-col items-center justify-center rounded-2xl border-2 transition-all overflow-hidden
                            ${s.isBooked ? 'bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed' : 
                              isSelected ? 'bg-black border-black shadow-lg text-white scale-105 z-10' : 'bg-white border-gray-200 hover:border-gray-400 text-gray-800'}`}
                        >
                          {isSelected && <div className="absolute top-0 w-full h-1.5 bg-indigo-500"></div>}
                          <span className="text-lg font-black">{s.seatNumber}</span>
                          <span className={`text-[9px] font-bold uppercase mt-1 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>{s.seatType || 'Seat'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Checkout Form Area */}
              {showBookForm && (
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 animate-in slide-in-from-top-4 duration-300">
                  <h4 className="text-lg font-black text-gray-900 mb-4">Passenger Info</h4>
                  {bError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold mb-4">{String(bError)}</div>}
                  {bSuccess && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm font-bold mb-4">
                      ✓ {bSuccess}
                      {bBooking?.bookingId && (
                        <div className="mt-2 space-y-1 text-xs">
                          <div>Booking ID: <strong>{bBooking.bookingId}</strong></div>
                          {bBooking.pickupCode && <div>Pickup Code: <strong className="font-black tracking-widest bg-green-100 px-2 py-0.5 rounded">{bBooking.pickupCode}</strong></div>}
                          {bBooking.dropCode && <div>Drop Code: <strong className="font-black tracking-widest bg-green-100 px-2 py-0.5 rounded">{bBooking.dropCode}</strong></div>}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="passengerName" placeholder="Full Name" value={bookForm.passengerName} onChange={(e) => setBookForm({...bookForm, passengerName: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-black font-semibold text-sm" />
                    <input name="customerMobile" placeholder="Phone Number *" value={bookForm.customerMobile} onChange={(e) => setBookForm({...bookForm, customerMobile: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-black font-semibold text-sm" required />
                    <input name="customerEmail" type="email" placeholder="Email *" value={bookForm.customerEmail} onChange={(e) => setBookForm({...bookForm, customerEmail: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-black font-semibold text-sm md:col-span-2" required />
                    <select name="paymentMethod" value={bookForm.paymentMethod} onChange={(e) => setBookForm({...bookForm, paymentMethod: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-black font-semibold text-sm md:col-span-2">
                      <option>Online</option><option>Offline</option><option>Cash</option><option>UPI</option><option>Card</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Glassmorphism Action Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 flex items-center justify-between z-20">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Total Amount</span>
                <span className="text-3xl font-black text-gray-900">
                  ₹{carObj.sharingType === 'Shared' 
                      ? selectedSeats.reduce((acc, id) => {
                          const s = seatsArray.find(seat => seat._id === id || seat.seatNumber === id);
                          return acc + (s ? (s.seatPrice || carObj.perPersonCost) : 0);
                        }, 0) 
                      : carObj.price}
                </span>
              </div>
              
              {!showBookForm ? (
                <button 
                  className="bg-black text-white font-bold px-10 py-4 rounded-full shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
                  disabled={carObj.sharingType === 'Shared' && selectedSeats.length === 0}
                  onClick={() => setShowBookForm(true)}
                >
                  Book Now
                </button>
              ) : (
                <button 
                  className="bg-indigo-600 text-white font-bold px-10 py-4 rounded-full shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  disabled={bLoading} onClick={submitBooking}
                >
                  {bLoading ? 'Processing...' : 'Pay & Confirm'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Hide Scrollbar util */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}