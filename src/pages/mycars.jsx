import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import {
  addCar, getAllCars, getCarsByOwner,
  updateCar, deleteCar, getSeatData,
  clearSeatData, clearCarError, clearCarSuccess,
} from '../redux/slices/carSlice'
import {
  createTravelBooking, clearBookingError, clearBookingSuccess,
} from '../redux/slices/bookingSlice'
import { BaseUrl } from '../utils/baseUrl'

const EMPTY_CAR = {
  make: '', model: '', vehicleType: 'Car', sharingType: 'Private',
  year: '', price: '', perPersonCost: '', color: '', fuelType: 'Petrol',
  transmission: 'Manual', seater: '', pickupP: '', dropP: '',
  vehicleNumber: '', mileage: '', extraKm: '',
  ownerId: '',
  ownerName: '', ownerMobile: '', ownerEmail: '',
  ownerDrivingLicence: '', ownerAddress: '', ownerCity: '', ownerState: '', ownerPinCode: '',
  pickupD: '', dropD: '',
}
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1503376760367-1db5e3067eb5?w=600&auto=format&fit=crop'

const FUEL_BADGE = {
  Petrol: 'bg-orange-100 text-orange-700',
  Diesel: 'bg-stone-100 text-stone-700',
  Electric: 'bg-green-100 text-green-700',
  Hybrid: 'bg-teal-100 text-teal-700',
}

function Inp({ label, className, ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>}
      <input
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none
          focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all placeholder:text-gray-400"
        {...props}
      />
    </div>
  )
}

function Sel({ label, className, children, ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>}
      <select
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none
          focus:border-zinc-400 transition-all"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-2xl md:rounded-3xl rounded-t-3xl flex flex-col max-h-[92vh] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs font-semibold text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors shrink-0 ml-4 text-lg leading-none">
            ×
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function MyCarsPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const { cars, seatData, loading, error, success } = useSelector((s) => s.cars)
  const bk = useSelector((s) => s.bookings)

  const [modal, setModal] = useState(null)
  const [addForm, setAddForm] = useState({ ...EMPTY_CAR })
  const [addImages, setAddImages] = useState(null)
  const [addSeatConfig, setAddSeatConfig] = useState([])
  const [editForm, setEditForm] = useState({})
  const [editImages, setEditImages] = useState(null)
  const [editSeatConfig, setEditSeatConfig] = useState([])
  const [bookForm, setBookForm] = useState({ passengerName: '', customerMobile: '', customerEmail: '', paymentMethod: 'Online', paymentId: '' })
  const [selectedSeats, setSelectedSeats] = useState([])
  const [toast, setToast] = useState(null)

  // --- Owner user picker state ---
  const [allUsers, setAllUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [showUserPicker, setShowUserPicker] = useState(false)
  const [userPickerLoading, setUserPickerLoading] = useState(false)
  const userPickerRef = useRef(null)

  useEffect(() => { dispatch(getAllCars()) }, [dispatch])
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // Close user picker on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (userPickerRef.current && !userPickerRef.current.contains(e.target)) {
        setShowUserPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchAllUsers() {
    setUserPickerLoading(true)
    try {
      const res = await axios.get(`${BaseUrl}/login/dashboard/get/all/user`)
      const list = res.data?.data || res.data || []
      setAllUsers(Array.isArray(list) ? list : [])
    } catch {
      setAllUsers([])
    } finally {
      setUserPickerLoading(false)
    }
  }

  async function selectOwner(userData) {
    const listName = userData.userName || userData.name || userData.fullName || ''
    ua('ownerId', userData._id || '')
    ua('ownerName', listName)
    ua('ownerEmail', userData.email || '')
    ua('ownerMobile', String(userData.mobile || ''))
    setShowUserPicker(false)
    setUserSearch('')
    // Fetch full profile — get userName + address
    try {
      const res = await axios.get(`${BaseUrl}/login/dashboard/get/all/user/${userData._id}`)
      const full = res.data?.data || {}
      const fullName = full.userName || full.name || full.fullName || listName
      if (fullName) ua('ownerName', fullName)
      if (full.address) ua('ownerAddress', full.address)
    } catch {
      // use whatever we already filled
    }
  }

  function openModal(type, car) {
    dispatch(clearCarError()); dispatch(clearBookingError()); dispatch(clearBookingSuccess()); dispatch(clearCarSuccess())
    if (type === 'edit' && car) {
      setEditForm({
        make: car.make || '', model: car.model || '', price: car.price || '',
        color: car.color || '', pickupP: car.pickupP || '', dropP: car.dropP || '',
        seater: car.seater || '', perPersonCost: car.perPersonCost || '',
        vehicleNumber: car.vehicleNumber || '', vehicleType: car.vehicleType || 'Car',
        sharingType: car.sharingType || 'Private', fuelType: car.fuelType || 'Petrol',
        transmission: car.transmission || 'Manual', mileage: car.mileage || '',
        year: car.year || '', extraKm: car.extraKm || '', ownerName: '',
        pickupD: car.pickupD ? car.pickupD.slice(0, 16) : '',
        dropD: car.dropD ? car.dropD.slice(0, 16) : '',
      })
      setEditSeatConfig(
        (car.seatConfig || []).map((s) => ({
          seatType: s.seatType || 'Window',
          seatNumber: s.seatNumber ?? '',
          seatPrice: s.seatPrice ?? '',
        }))
      )
    }
    if (type === 'seats' || type === 'book') dispatch(getSeatData(car._id))
    if (type === 'book') { setBookForm({ passengerName: '', customerMobile: '', customerEmail: '', paymentMethod: 'Online', paymentId: '' }); setSelectedSeats([]) }
    setModal({ type, car })
  }

  function closeModal() {
    setModal(null)
    dispatch(clearSeatData()); dispatch(clearCarError()); dispatch(clearCarSuccess())
    dispatch(clearBookingError()); dispatch(clearBookingSuccess())
  }

  function onAdd(e) {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(addForm).forEach(([k, v]) => { if (v !== '' && v != null) fd.append(k, String(v)) })
    if (addForm.sharingType === 'Shared') {
      fd.append('seatConfig', JSON.stringify(addSeatConfig.map((s) => ({
        seatType: s.seatType,
        seatNumber: Number(s.seatNumber),
        seatPrice: Number(s.seatPrice),
      }))))
    }
    if (addImages) for (const f of addImages) fd.append('images', f)
    dispatch(addCar(fd)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        setAddForm({ ...EMPTY_CAR })
        setAddImages(null)
        setAddSeatConfig([])
        setToast(res.payload?.message || 'Car added successfully')
        closeModal()
        dispatch(getAllCars())
      }
    })
  }

  function onUpdate(e) {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(editForm).forEach(([k, v]) => { if (v !== '' && v != null) fd.append(k, String(v)) })
    // Backend auth middleware nahi hai — ownerId explicitly bhejna hai
    const loggedId = user?.id || localStorage.getItem('loggedUserId') || ''
    if (loggedId) fd.append('ownerId', loggedId)
    if (editForm.sharingType === 'Shared') {
      fd.append('seatConfig', JSON.stringify(editSeatConfig.map((s) => ({
        seatType: s.seatType,
        seatNumber: Number(s.seatNumber),
        seatPrice: Number(s.seatPrice),
      }))))
    }
    if (editImages) for (const f of editImages) fd.append('images', f)
    dispatch(updateCar({ carId: modal.car._id, carData: fd })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        setToast(res.payload?.message || 'Car updated successfully')
        closeModal()
        dispatch(getAllCars())
      }
    })
  }

  function onDelete(carId) {
    if (window.confirm('Delete this car? This cannot be undone.')) dispatch(deleteCar(carId))
  }

  function onBook(e) {
    e.preventDefault()
    const car = modal.car
    if (car.sharingType === 'Shared' && selectedSeats.length === 0) return
    const data = {
      userId: user?.id || user?._id || '',
      carId: car._id,
      ...bookForm,
      vehicleType: car.vehicleType,
      sharingType: car.sharingType,
    }
    if (car.pickupD) data.pickupD = car.pickupD
    if (car.dropD) data.dropD = car.dropD
    if (car.sharingType === 'Shared') data.seats = selectedSeats
    dispatch(createTravelBooking(data))
  }

  function toggleSeat(id) { setSelectedSeats((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]) }

  const ua = (k, v) => setAddForm((f) => ({ ...f, [k]: v }))
  const ue = (k, v) => {
    setEditForm((f) => ({ ...f, [k]: v }))
    if (k === 'sharingType' && v === 'Private') setEditSeatConfig([])
  }
  const ubk = (k, v) => setBookForm((f) => ({ ...f, [k]: v }))
  const seats = seatData?.seats || seatData?.seatConfig || []

  const CAR_FORM_FIELDS = (form, upd) => (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Make *" placeholder="Toyota" value={form.make} onChange={(e) => upd('make', e.target.value)} required />
        <Inp label="Model *" placeholder="Innova" value={form.model} onChange={(e) => upd('model', e.target.value)} required />
        <Sel label="Vehicle Type" value={form.vehicleType} onChange={(e) => upd('vehicleType', e.target.value)}>
          <option>Car</option><option>Bike</option><option>Bus</option>
        </Sel>
        <Sel label="Sharing" value={form.sharingType} onChange={(e) => upd('sharingType', e.target.value)}>
          <option>Private</option><option>Shared</option>
        </Sel>
        <Inp label="Year *" type="number" placeholder="2024" value={form.year} onChange={(e) => upd('year', e.target.value)} />
        <Inp label="Price ₹ *" type="number" placeholder="1500" value={form.price} onChange={(e) => upd('price', e.target.value)} />
        <Inp label="Color *" placeholder="White" value={form.color} onChange={(e) => upd('color', e.target.value)} />
        <Sel label="Fuel Type" value={form.fuelType} onChange={(e) => upd('fuelType', e.target.value)}>
          <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
        </Sel>
        <Sel label="Transmission" value={form.transmission} onChange={(e) => upd('transmission', e.target.value)}>
          <option>Manual</option><option>Automatic</option>
        </Sel>
        <Inp label="Seater" type="number" placeholder="7" value={form.seater} onChange={(e) => upd('seater', e.target.value)} />
        <Inp label="Pickup City" placeholder="Delhi" value={form.pickupP} onChange={(e) => upd('pickupP', e.target.value)} />
        <Inp label="Drop City" placeholder="Mumbai" value={form.dropP} onChange={(e) => upd('dropP', e.target.value)} />
        <Inp label="Pickup Date" type="datetime-local" value={form.pickupD} onChange={(e) => upd('pickupD', e.target.value)} />
        <Inp label="Drop Date" type="datetime-local" value={form.dropD} onChange={(e) => upd('dropD', e.target.value)} />
        <Inp label="Vehicle No." placeholder="DL01AB1234" value={form.vehicleNumber} onChange={(e) => upd('vehicleNumber', e.target.value)} />
        <Inp label="Per Person ₹" type="number" placeholder="500" value={form.perPersonCost} onChange={(e) => upd('perPersonCost', e.target.value)} />
        <Inp label="Mileage km/l" type="number" placeholder="15" value={form.mileage} onChange={(e) => upd('mileage', e.target.value)} />
        <Inp label="Extra KM ₹" type="number" placeholder="10" value={form.extraKm} onChange={(e) => upd('extraKm', e.target.value)} />
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-6xl mx-auto px-4 pt-6">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => dispatch(getAllCars())}
              className="px-4 py-2 text-xs font-black bg-white border border-gray-200 rounded-full hover:bg-zinc-900 hover:text-white hover:border-zinc-900 active:scale-95 transition-all uppercase tracking-wide">
              All Cars
            </button>
            <button type="button" onClick={() => { const id = user?.id || localStorage.getItem('loggedUserId'); if (id) dispatch(getCarsByOwner(id)) }}
              className="px-4 py-2 text-xs font-black bg-white border border-gray-200 rounded-full hover:bg-zinc-900 hover:text-white hover:border-zinc-900 active:scale-95 transition-all uppercase tracking-wide">
              My Cars
            </button>

          </div>
          <button type="button" onClick={() => openModal('add')}
            className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wide hover:bg-zinc-700 active:scale-95 transition-all shadow-lg shadow-zinc-900/20">
            + Add Car
          </button>
        </div>

        {loading && <div className="h-16 flex items-center justify-center text-gray-400 font-bold text-sm animate-pulse">Loading fleet...</div>}
        {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-3 font-semibold text-sm">{String(error)}</div>}
        {toast && (
          <div className="mb-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl px-5 py-3 font-semibold text-sm flex items-center justify-between">
            <span>✓ {toast}</span>
            <button type="button" onClick={() => setToast(null)} className="text-green-400 hover:text-green-600 font-black text-lg leading-none ml-3">×</button>
          </div>
        )}
        {success && !toast && <div className="mb-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl px-5 py-3 font-semibold text-sm">✓ {success}</div>}

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cars.map((car) => {
            const fuelBadge = FUEL_BADGE[car.fuelType] || 'bg-gray-100 text-gray-600'
            const img = car.images?.[0] || FALLBACK_IMG
            return (
              <div key={car._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  <img src={img} alt={car.make} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 flex gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${fuelBadge}`}>{car.fuelType}</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-white/90 text-gray-800">{car.sharingType}</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                      {car.vehicleType}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{car.make} {car.model}</h3>
                    <span className="text-lg font-black text-gray-900 shrink-0 ml-2">₹{car.price || car.perPersonCost || 0}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">{car.vehicleNumber || 'No reg.'}</p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-4">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">{car.seater} seats</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">{car.transmission}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-24">{car.pickupP || '–'} → {car.dropP || '–'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const fd = new FormData()
                      fd.append('isAvailable', String(!car.isAvailable))
                      const loggedId = user?.id || localStorage.getItem('loggedUserId') || ''
                      if (loggedId) fd.append('ownerId', loggedId)
                      dispatch(updateCar({ carId: car._id, carData: fd })).then((res) => {
                        if (res.meta.requestStatus === 'fulfilled') {
                          setToast(car.isAvailable ? 'Car set offline' : 'Car set live')
                          dispatch(getAllCars())
                        }
                      })
                    }}
                    className={`w-full py-2.5 text-xs font-black rounded-xl transition-all active:scale-95 uppercase tracking-wide mb-2 ${
                      car.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-zinc-900 hover:text-white'
                    }`}>
                    {car.isAvailable ? '🟢 Live — Set Offline' : '🔴 Offline — Set Live'}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => openModal('edit', car)}
                      className="py-2.5 text-xs font-black bg-gray-100 text-gray-700 rounded-xl hover:bg-zinc-900 hover:text-white transition-all active:scale-95 uppercase tracking-wide">
                      ✏️ Edit
                    </button>
                    <button type="button" onClick={() => onDelete(car._id)}
                      className="py-2.5 text-xs font-black bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 uppercase tracking-wide">
                      🗑️ Delete
                    </button>
                    <button type="button" onClick={() => openModal('seats', car)}
                      className="py-2.5 text-xs font-black bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 uppercase tracking-wide">
                      💺 Seats
                    </button>
                    <button type="button" onClick={() => openModal('book', car)}
                      className="py-2.5 text-xs font-black bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 uppercase tracking-wide">
                      📅 Book
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── ADD CAR MODAL ── */}
      {modal?.type === 'add' && (
        <Modal title="Add New Car" subtitle="Fill in all vehicle details to list it on the platform" onClose={closeModal}>
          <form onSubmit={onAdd} className="space-y-6">

            {/* ── Section 1: Vehicle Info ── */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[9px] flex items-center justify-center font-black">1</span>
                Vehicle Info
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Inp label="Make *" placeholder="Toyota" value={addForm.make} onChange={(e) => ua('make', e.target.value)} required />
                <Inp label="Model *" placeholder="Innova" value={addForm.model} onChange={(e) => ua('model', e.target.value)} required />
                <Sel label="Vehicle Type *" value={addForm.vehicleType} onChange={(e) => ua('vehicleType', e.target.value)}>
                  <option>Car</option><option>Bike</option><option>Bus</option>
                </Sel>
                <Sel label="Sharing Type *" value={addForm.sharingType} onChange={(e) => { ua('sharingType', e.target.value); if (e.target.value === 'Private') setAddSeatConfig([]) }}>
                  <option>Private</option><option>Shared</option>
                </Sel>
                <Inp label="Year *" type="number" placeholder="2024" min="2000" max="2026" value={addForm.year} onChange={(e) => ua('year', e.target.value)} required />
                <Inp label="Color *" placeholder="White" value={addForm.color} onChange={(e) => ua('color', e.target.value)} required />
                <Inp label="Vehicle Number" placeholder="DL01AB1234" value={addForm.vehicleNumber} onChange={(e) => ua('vehicleNumber', e.target.value)} />
                <Inp label="Seater" type="number" placeholder="7" value={addForm.seater} onChange={(e) => ua('seater', e.target.value)} />
              </div>
            </div>

            {/* ── Section 2: Specs ── */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[9px] flex items-center justify-center font-black">2</span>
                Specs
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Sel label="Fuel Type *" value={addForm.fuelType} onChange={(e) => ua('fuelType', e.target.value)}>
                  <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
                </Sel>
                <Sel label="Transmission *" value={addForm.transmission} onChange={(e) => ua('transmission', e.target.value)}>
                  <option>Manual</option><option>Automatic</option>
                </Sel>
                <Inp label="Mileage (km/l)" type="number" placeholder="15" value={addForm.mileage} onChange={(e) => ua('mileage', e.target.value)} />
                <Inp label="Extra KM ₹" type="number" placeholder="10" value={addForm.extraKm} onChange={(e) => ua('extraKm', e.target.value)} />
              </div>
            </div>

            {/* ── Section 3: Trip Details ── */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[9px] flex items-center justify-center font-black">3</span>
                Trip Details
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Inp label="Pickup City" placeholder="Delhi" value={addForm.pickupP} onChange={(e) => ua('pickupP', e.target.value)} />
                <Inp label="Drop City" placeholder="Jaipur" value={addForm.dropP} onChange={(e) => ua('dropP', e.target.value)} />
                <Inp label="Pickup Date & Time" type="datetime-local" value={addForm.pickupD} onChange={(e) => ua('pickupD', e.target.value)} />
                <Inp label="Drop Date & Time" type="datetime-local" value={addForm.dropD} onChange={(e) => ua('dropD', e.target.value)} />
              </div>
            </div>

            {/* ── Section 4: Pricing ── */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[9px] flex items-center justify-center font-black">4</span>
                Pricing
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Inp label="Base Price ₹ *" type="number" placeholder="2500" value={addForm.price} onChange={(e) => ua('price', e.target.value)} required />
                <Inp label="Per Person ₹" type="number" placeholder="450" value={addForm.perPersonCost} onChange={(e) => ua('perPersonCost', e.target.value)} />
              </div>
              {addForm.sharingType === 'Private' && (
                <p className="mt-2 text-[10px] text-gray-400 font-semibold">Private trip: Base Price is the total trip cost.</p>
              )}
              {addForm.sharingType === 'Shared' && (
                <p className="mt-2 text-[10px] text-gray-400 font-semibold">Shared trip: Per Person ₹ overrides individual seat pricing if seat config is empty.</p>
              )}
            </div>

            {/* ── Section 5: Seat Config (Shared only) ── */}
            {addForm.sharingType === 'Shared' && (
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[9px] flex items-center justify-center font-black">5</span>
                    Seat Configuration
                  </p>
                  <button
                    type="button"
                    onClick={() => setAddSeatConfig((p) => [...p, { seatType: 'Window', seatNumber: p.length + 1, seatPrice: '' }])}
                    className="flex items-center gap-1.5 text-xs font-black bg-zinc-900 text-white px-3 py-1.5 rounded-full hover:bg-zinc-700 active:scale-95 transition-all">
                    + Add Seat
                  </button>
                </div>
                {addSeatConfig.length === 0 && (
                  <p className="text-sm text-gray-400 font-semibold text-center py-4 bg-gray-50 rounded-2xl">
                    No seats configured. Press &quot;+ Add Seat&quot; to begin.
                  </p>
                )}
                <div className="space-y-2">
                  {addSeatConfig.map((seat, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_72px_90px_36px] gap-2 items-center">
                      <select
                        value={seat.seatType}
                        onChange={(e) => setAddSeatConfig((p) => p.map((s, i) => i === idx ? { ...s, seatType: e.target.value } : s))}
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-zinc-400 transition-all">
                        <option>Window</option>
                        <option>Middle</option>
                        <option>Aisle</option>
                      </select>
                      <input
                        type="number" placeholder="No."
                        value={seat.seatNumber}
                        onChange={(e) => setAddSeatConfig((p) => p.map((s, i) => i === idx ? { ...s, seatNumber: e.target.value } : s))}
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-zinc-400 transition-all w-full" />
                      <input
                        type="number" placeholder="₹ Price"
                        value={seat.seatPrice}
                        onChange={(e) => setAddSeatConfig((p) => p.map((s, i) => i === idx ? { ...s, seatPrice: e.target.value } : s))}
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-zinc-400 transition-all w-full" />
                      <button
                        type="button"
                        onClick={() => setAddSeatConfig((p) => p.filter((_, i) => i !== idx))}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black text-lg leading-none">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {addSeatConfig.length > 0 && (
                  <div className="mt-3 flex items-center justify-between bg-zinc-50 rounded-2xl px-4 py-2.5">
                    <span className="text-xs font-black text-gray-500">{addSeatConfig.length} seat{addSeatConfig.length > 1 ? 's' : ''} configured</span>
                    <span className="text-xs font-black text-zinc-700">
                      Avg ₹{addSeatConfig.length ? Math.round(addSeatConfig.reduce((a, s) => a + (Number(s.seatPrice) || 0), 0) / addSeatConfig.length) : 0}/seat
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── Section 6: Owner Details ── */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[9px] flex items-center justify-center font-black">{addForm.sharingType === 'Shared' ? '6' : '5'}</span>
                Owner Details <span className="normal-case font-semibold text-gray-300">(required)</span>
              </p>

              {/* ── Owner ID + Browse Users ── */}
              <div className="col-span-2 mb-3" ref={userPickerRef}>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Owner ID (existing)</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all placeholder:text-gray-400"
                    placeholder="Paste existing owner ID or pick from users below"
                    value={addForm.ownerId}
                    onChange={(e) => ua('ownerId', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!showUserPicker) { fetchAllUsers(); setShowUserPicker(true) }
                      else setShowUserPicker(false)
                    }}
                    className="shrink-0 px-4 py-3 text-xs font-black bg-zinc-900 text-white rounded-2xl hover:bg-zinc-700 active:scale-95 transition-all whitespace-nowrap">
                    {showUserPicker ? '✕ Close' : '👤 Browse Users'}
                  </button>
                  {addForm.ownerId && (
                    <button
                      type="button"
                      onClick={() => {
                        ua('ownerId', ''); ua('ownerName', ''); ua('ownerEmail', '')
                        ua('ownerMobile', ''); ua('ownerAddress', '')
                      }}
                      className="shrink-0 px-3 py-3 text-xs font-black bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white active:scale-95 transition-all">
                      Clear
                    </button>
                  )}
                </div>

                {/* ── Selected owner badge ── */}
                {addForm.ownerId && addForm.ownerName && (
                  <div className="mt-2 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                    <span className="text-emerald-600 text-base">✓</span>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-emerald-800 truncate">{addForm.ownerName}</p>
                      <p className="text-[10px] text-emerald-600 truncate">{addForm.ownerEmail} · {addForm.ownerMobile}</p>
                    </div>
                  </div>
                )}

                {/* ── User Picker Dropdown ── */}
                {showUserPicker && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-20 relative">
                    <div className="p-3 border-b border-gray-100">
                      <input
                        autoFocus
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name, email or mobile..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-zinc-400 transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
                      {userPickerLoading && (
                        <p className="text-center text-xs font-semibold text-gray-400 py-6 animate-pulse">Loading users...</p>
                      )}
                      {!userPickerLoading && allUsers.length === 0 && (
                        <p className="text-center text-xs font-semibold text-gray-400 py-6">No users found.</p>
                      )}
                      {!userPickerLoading && allUsers
                        .filter((u) => {
                          const q = userSearch.toLowerCase()
                          return !q ||
                            (u.userName || '').toLowerCase().includes(q) ||
                            (u.email || '').toLowerCase().includes(q) ||
                            String(u.mobile || '').includes(q)
                        })
                        .map((u) => (
                          <button
                            key={u._id}
                            type="button"
                            onClick={() => selectOwner(u)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 active:bg-zinc-100 transition-colors text-left">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {u.images?.[0]
                                ? <img src={u.images[0]} alt="" className="w-full h-full object-cover" />
                                : <span className="text-sm font-black text-zinc-600">{(u.userName || u.name || u.fullName || '?')[0].toUpperCase()}</span>
                              }
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-black text-gray-900 truncate">{u.userName || u.name || u.fullName || '—'}</p>
                              <p className="text-[10px] font-semibold text-gray-400 truncate">{u.email} · {u.mobile}</p>
                            </div>
                            <span className="text-[9px] font-black text-gray-300 shrink-0">SELECT →</span>
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>

              {!addForm.ownerId && (
                <p className="col-span-2 text-[10px] text-amber-600 font-semibold bg-amber-50 rounded-xl px-3 py-2 mb-3">
                  No Owner ID? Fill name + email/mobile below to create a new owner.
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Inp label="Owner Name" placeholder="Ravi Yadav" value={addForm.ownerName} onChange={(e) => ua('ownerName', e.target.value)} />
                <Inp label="Owner Mobile *" placeholder="9876543210" value={addForm.ownerMobile} onChange={(e) => ua('ownerMobile', e.target.value)} />
                <Inp label="Owner Email *" type="email" className="col-span-2" placeholder="ravi@example.com" value={addForm.ownerEmail} onChange={(e) => ua('ownerEmail', e.target.value)} />
                <Inp label="Driving Licence" placeholder="DL-1234567890" value={addForm.ownerDrivingLicence} onChange={(e) => ua('ownerDrivingLicence', e.target.value)} />
                <Inp label="City" placeholder="Delhi" value={addForm.ownerCity} onChange={(e) => ua('ownerCity', e.target.value)} />
                <Inp label="State" placeholder="Delhi" value={addForm.ownerState} onChange={(e) => ua('ownerState', e.target.value)} />
                <Inp label="Pin Code" placeholder="110001" value={addForm.ownerPinCode} onChange={(e) => ua('ownerPinCode', e.target.value)} />
                <Inp label="Address" placeholder="123 MG Road" className="col-span-2" value={addForm.ownerAddress} onChange={(e) => ua('ownerAddress', e.target.value)} />
              </div>
            </div>

            {/* ── Section 7: Images ── */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[9px] flex items-center justify-center font-black">{addForm.sharingType === 'Shared' ? '7' : '6'}</span>
                Car Images
              </p>
              <input type="file" multiple accept="image/*" onChange={(e) => setAddImages(e.target.files)}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all" />
              {addImages && addImages.length > 0 && (
                <p className="mt-2 text-xs text-gray-400 font-semibold">{addImages.length} file{addImages.length > 1 ? 's' : ''} selected</p>
              )}
            </div>

            {error && <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-semibold">{String(error)}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-zinc-900 text-white font-black py-4 rounded-2xl hover:bg-zinc-700 active:scale-[0.98] transition-all disabled:opacity-40 text-sm">
              {loading ? 'Adding Car...' : '+ Add Car'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── EDIT CAR MODAL ── */}
      {modal?.type === 'edit' && (
        <Modal title={`Edit ${modal.car.make} ${modal.car.model}`} subtitle={modal.car.vehicleNumber} onClose={closeModal}>
          <form onSubmit={onUpdate} className="space-y-4">
            {CAR_FORM_FIELDS(editForm, ue)}
            {editForm.sharingType === 'Shared' && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seat Configuration</p>
                  <button
                    type="button"
                    onClick={() => setEditSeatConfig((p) => [...p, { seatType: 'Window', seatNumber: p.length + 1, seatPrice: '' }])}
                    className="flex items-center gap-1.5 text-xs font-black bg-zinc-900 text-white px-3 py-1.5 rounded-full hover:bg-zinc-700 active:scale-95 transition-all">
                    + Add Seat
                  </button>
                </div>
                {editSeatConfig.length === 0 && (
                  <p className="text-sm text-gray-400 font-semibold text-center py-4 bg-gray-50 rounded-2xl">
                    No seats configured. Press "+ Add Seat" to begin.
                  </p>
                )}
                <div className="space-y-2">
                  {editSeatConfig.map((seat, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_72px_90px_36px] gap-2 items-center">
                      <select
                        value={seat.seatType}
                        onChange={(e) => setEditSeatConfig((p) => p.map((s, i) => i === idx ? { ...s, seatType: e.target.value } : s))}
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-zinc-400 transition-all">
                        <option>Window</option>
                        <option>Middle</option>
                        <option>Aisle</option>
                      </select>
                      <input
                        type="number" placeholder="No."
                        value={seat.seatNumber}
                        onChange={(e) => setEditSeatConfig((p) => p.map((s, i) => i === idx ? { ...s, seatNumber: e.target.value } : s))}
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-zinc-400 transition-all w-full" />
                      <input
                        type="number" placeholder="₹ Price"
                        value={seat.seatPrice}
                        onChange={(e) => setEditSeatConfig((p) => p.map((s, i) => i === idx ? { ...s, seatPrice: e.target.value } : s))}
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-zinc-400 transition-all w-full" />
                      <button
                        type="button"
                        onClick={() => setEditSeatConfig((p) => p.filter((_, i) => i !== idx))}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black text-lg leading-none">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Inp label="Owner Name" placeholder="Owner name (optional)" value={editForm.ownerName} onChange={(e) => ue('ownerName', e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Replace Images</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setEditImages(e.target.files)}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all" />
            </div>
            {error && <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-semibold">{String(error)}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-zinc-900 text-white font-black py-4 rounded-2xl hover:bg-zinc-700 active:scale-[0.98] transition-all disabled:opacity-40 text-sm">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── SEATS MODAL ── */}
      {modal?.type === 'seats' && (
        <Modal title="Seat Map" subtitle={`${modal.car.make} ${modal.car.model} · ${modal.car.seater} Total Seats`} onClose={closeModal}>
          {loading && <p className="text-gray-400 font-semibold text-sm text-center py-8 animate-pulse">Fetching seat data...</p>}
          {seats.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">💺</div>
              <p className="text-gray-400 font-bold">No seat data available.</p>
            </div>
          )}
          {seats.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {seats.map((s) => (
                <div key={s._id}
                  className={`rounded-2xl p-3 border-2 text-center transition-all ${s.isBooked ? 'bg-red-50 border-red-100 opacity-70' : 'bg-emerald-50 border-emerald-100'}`}>
                  <div className="text-xl mb-1">{s.isBooked ? '🔴' : '🟢'}</div>
                  <div className="text-base font-black text-gray-900">#{s.seatNumber}</div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{s.seatType}</div>
                  <div className="text-sm font-black text-gray-700 mt-1">₹{s.seatPrice}</div>
                  <div className={`mt-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${s.isBooked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                    {s.isBooked ? 'Booked' : 'Free'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* ── BOOK CAR MODAL ── */}
      {modal?.type === 'book' && (
        <Modal title="Create Booking" subtitle={`${modal.car.make} ${modal.car.model} · ${modal.car.sharingType}`} onClose={closeModal}>
          {modal.car.sharingType === 'Shared' && loading && (
            <p className="text-gray-400 font-semibold text-sm text-center py-6 animate-pulse">Loading available seats...</p>
          )}
          {modal.car.sharingType === 'Shared' && seats.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Seats</span>
                <span className="bg-zinc-900 text-white text-xs font-black px-3 py-1 rounded-full">{selectedSeats.length} selected</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {seats.map((s) => (
                  <button key={s._id} type="button" disabled={s.isBooked} onClick={() => toggleSeat(s._id)}
                    className={`p-2.5 rounded-2xl border-2 text-center text-xs font-black transition-all ${
                      s.isBooked ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed' :
                      selectedSeats.includes(s._id) ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg' :
                      'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                    }`}>
                    #{s.seatNumber}
                  </button>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={onBook} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Passenger Name" placeholder="Full name" value={bookForm.passengerName} onChange={(e) => ubk('passengerName', e.target.value)} />
              <Inp label="Mobile *" placeholder="9999999999" value={bookForm.customerMobile} onChange={(e) => ubk('customerMobile', e.target.value)} required />
              <Inp label="Email *" type="email" className="col-span-2" placeholder="email@example.com" value={bookForm.customerEmail} onChange={(e) => ubk('customerEmail', e.target.value)} required />
              <Sel label="Payment Method" value={bookForm.paymentMethod} onChange={(e) => ubk('paymentMethod', e.target.value)}>
                <option>Online</option><option>Offline</option><option>Cash</option><option>UPI</option><option>Card</option>
              </Sel>
              <Inp label="Payment ID" placeholder="Optional" value={bookForm.paymentId} onChange={(e) => ubk('paymentId', e.target.value)} />
            </div>
            {bk.error && <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-semibold">{String(bk.error)}</div>}
            {bk.success && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl px-4 py-3 text-sm font-semibold">
                ✓ {bk.success}
                {bk.booking?.bookingId && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div>Booking ID: <strong>{bk.booking.bookingId}</strong></div>
                    <div>Pickup Code: <strong className="font-black tracking-widest bg-emerald-100 px-2 py-0.5 rounded">{bk.booking.pickupCode}</strong></div>
                    <div>Drop Code: <strong className="font-black tracking-widest bg-emerald-100 px-2 py-0.5 rounded">{bk.booking.dropCode}</strong></div>
                  </div>
                )}
              </div>
            )}
            {modal.car.sharingType === 'Shared' && selectedSeats.length === 0 && !loading && seats.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl px-4 py-2.5 text-xs font-semibold">Please select at least 1 seat to continue.</div>
            )}
            <button type="submit" disabled={bk.loading || (modal.car.sharingType === 'Shared' && selectedSeats.length === 0)}
              className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-40 shadow-lg shadow-emerald-500/20 text-sm">
              {bk.loading ? 'Creating Booking...' : '📅 Create Booking'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
