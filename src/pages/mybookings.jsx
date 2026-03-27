import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllBookings, getBookingsByUserId, getBookingsByMobile, getBookingsByOwner,
  changeBookingStatus, updateBooking, confirmBooking,
  verifyPickupCode, verifyDropCode,
  clearBookingError, clearBookingSuccess,
} from '../redux/slices/bookingSlice'

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Failed']

const STATUS_STYLE = {
  Pending:   { pill: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400',   icon: '⏳' },
  Confirmed: { pill: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400',    icon: '✅' },
  Completed: { pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400', icon: '🏁' },
  Cancelled: { pill: 'bg-red-100 text-red-700',       dot: 'bg-red-400',     icon: '❌' },
  Failed:    { pill: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-300',    icon: '⚠️' },
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
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:border-zinc-400 transition-all"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full md:max-w-xl md:rounded-3xl rounded-t-3xl flex flex-col max-h-[85vh] shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">{children}</div>
      </div>
    </div>
  )
}

export default function MyBookingsPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const { bookings, loading, error, success } = useSelector((s) => s.bookings)

  const [modal, setModal] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchMobile, setSearchMobile] = useState('')
  const [searchOwnerId, setSearchOwnerId] = useState('')
  const [searchUserId, setSearchUserId] = useState('')

  const [statusVal, setStatusVal] = useState('Confirmed')
  const [cancelReason, setCancelReason] = useState('')
  const [confirmForm, setConfirmForm] = useState({ assignedDriverId: '', assignedDriverName: '', isPaid: false, paymentId: '' })
  const [updateForm, setUpdateForm] = useState({ customerMobile: '', customerEmail: '', bookingStatus: '', cancellationReason: '', assignedDriverId: '', assignedDriverName: '', isPaid: '', paymentId: '', bookedBy: '' })
  const [pickupCode, setPickupCode] = useState('')
  const [dropCode, setDropCode] = useState('')

  useEffect(() => { dispatch(getAllBookings()) }, [dispatch])

  function openModal(type, booking) {
    dispatch(clearBookingError()); dispatch(clearBookingSuccess())
    if (type === 'update') {
      setUpdateForm({
        customerMobile: booking.customerMobile || '',
        customerEmail: booking.customerEmail || '',
        bookingStatus: booking.bookingStatus || '',
        cancellationReason: booking.cancellationReason || '',
        assignedDriverId: booking.assignedDriverId || '',
        assignedDriverName: booking.assignedDriverName || '',
        isPaid: booking.isPaid ? 'true' : 'false',
        paymentId: booking.paymentId || '',
        bookedBy: booking.bookedBy || '',
      })
    }
    setModal({ type, booking })
  }

  function closeModal() {
    setModal(null)
    dispatch(clearBookingError()); dispatch(clearBookingSuccess())
  }

  function onChangeStatus() {
    const data = { bookingStatus: statusVal }
    if (statusVal === 'Cancelled' && cancelReason) data.cancellationReason = cancelReason
    dispatch(changeBookingStatus({ bookingId: modal.booking._id, statusData: data }))
  }

  function onConfirm() {
    dispatch(confirmBooking({ bookingId: modal.booking._id, confirmData: confirmForm }))
  }

  function onUpdate() {
    const data = {}
    Object.entries(updateForm).forEach(([k, v]) => {
      if (v !== '' && v != null) data[k] = k === 'isPaid' ? v === 'true' : v
    })
    dispatch(updateBooking({ id: modal.booking._id, data }))
  }

  function onVerifyPickup() { dispatch(verifyPickupCode({ bookingId: modal.booking._id, pickupCode })) }
  function onVerifyDrop() { dispatch(verifyDropCode({ bookingId: modal.booking._id, dropCode })) }

  const uc = (k, v) => setConfirmForm((f) => ({ ...f, [k]: v }))
  const uu = (k, v) => setUpdateForm((f) => ({ ...f, [k]: v }))

  const filteredBookings = bookings.filter((b) => filterStatus === 'All' || b.bookingStatus === filterStatus)

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-6xl mx-auto px-4 pt-6">

        {/* Fetch Bar */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-5 py-5 mb-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Fetch Bookings</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <button type="button" onClick={() => dispatch(getAllBookings())}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-black rounded-full hover:bg-zinc-900 hover:text-white active:scale-95 transition-all uppercase tracking-wide">
              All
            </button>
            <button type="button" onClick={() => dispatch(getBookingsByUserId(user?.id || user?._id || ''))}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-black rounded-full hover:bg-zinc-900 hover:text-white active:scale-95 transition-all uppercase tracking-wide">
              Mine
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { val: searchMobile, set: setSearchMobile, plh: 'Mobile No.', action: () => searchMobile && dispatch(getBookingsByMobile(searchMobile)) },
              { val: searchOwnerId, set: setSearchOwnerId, plh: 'Owner ID', action: () => searchOwnerId && dispatch(getBookingsByOwner(searchOwnerId)) },
              { val: searchUserId, set: setSearchUserId, plh: 'User ID', action: () => searchUserId && dispatch(getBookingsByUserId(searchUserId)) },
            ].map(({ val, set, plh, action }) => (
              <div key={plh} className="flex gap-2">
                <input value={val} onChange={(e) => set(e.target.value)} placeholder={plh}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-xs font-semibold outline-none focus:border-gray-400 min-w-0 transition-all" />
                <button type="button" onClick={action}
                  className="px-3 py-2 bg-zinc-900 text-white rounded-full text-xs font-black hover:bg-zinc-700 active:scale-95 transition-all">
                  Go
                </button>
              </div>
            ))}
          </div>
        </div>

        {loading && <div className="h-16 flex items-center justify-center text-gray-400 font-bold text-sm animate-pulse">Loading bookings...</div>}
        {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-3 font-semibold text-sm">{String(error)}</div>}
        {success && <div className="mb-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl px-5 py-3 font-semibold text-sm">✓ {success}</div>}

        {/* Status Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {['All', ...STATUS_OPTIONS].map((s) => (
            <button key={s} type="button" onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide transition-all active:scale-95 ${
                filterStatus === s ? 'bg-zinc-900 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
              }`}>
              {STATUS_STYLE[s]?.icon} {s}
            </button>
          ))}
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBookings.map((b) => {
            const st = STATUS_STYLE[b.bookingStatus] || STATUS_STYLE.Pending
            return (
              <div key={b._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group">
                {/* Status color-stripe */}
                <div className={`h-1.5 ${st.dot}`} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Booking ID</p>
                      <h3 className="font-black text-gray-900 text-base tracking-tight">#{b.bookingId || b._id?.slice(-8)}</h3>
                      <p className="text-xs font-semibold text-gray-500 mt-0.5">{b.passengerName || b.customerMobile || 'Guest'}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${st.pill}`}>
                      {st.icon} {b.bookingStatus || 'Pending'}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 mb-4 border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-black uppercase text-gray-400">From</div>
                      <div className="text-sm font-bold text-gray-800 truncate">{b.pickupP || '–'}</div>
                    </div>
                    <div className="text-gray-300 text-lg shrink-0">→</div>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-[9px] font-black uppercase text-gray-400">To</div>
                      <div className="text-sm font-bold text-gray-800 truncate">{b.dropP || '–'}</div>
                    </div>
                  </div>

                  {/* Info chips */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      ['📱 Mobile', b.customerMobile || '–'],
                      ['💺 Seats', b.totalSeatsBooked || b.seats?.length || 0],
                      ['💰 Fare', `₹${b.price || b.basePrice || 0}`],
                      ['💳 Payment', b.paymentMethod || '–'],
                      ['✓ Paid', b.isPaid ? 'Yes' : 'No'],
                      ['🚗 Vehicle', b.vehicleNumber || '–'],
                      ['🔄 Ride', b.rideStatus || '–'],
                      ...(b.pickupCode ? [['📍 Pickup Code', b.pickupCode]] : []),
                      ...(b.dropCode ? [['🏁 Drop Code', b.dropCode]] : []),
                    ].map(([label, val]) => (
                      <div key={label} className="bg-gray-50 rounded-xl px-2.5 py-2">
                        <div className="text-[9px] font-black uppercase text-gray-400 leading-tight">{label}</div>
                        <div className="text-xs font-bold text-gray-800 truncate">{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-5 gap-1.5">
                    <button type="button" onClick={() => openModal('status', b)}
                      className="py-2.5 text-[9px] font-black bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-500 hover:text-white transition-all active:scale-95 uppercase tracking-wide leading-tight">
                      📋<br />Status
                    </button>
                    <button type="button" onClick={() => openModal('confirm', b)}
                      className="py-2.5 text-[9px] font-black bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 uppercase tracking-wide leading-tight">
                      ✅<br />Confirm
                    </button>
                    <button type="button" onClick={() => openModal('update', b)}
                      className="py-2.5 text-[9px] font-black bg-gray-100 text-gray-600 rounded-xl hover:bg-zinc-900 hover:text-white transition-all active:scale-95 uppercase tracking-wide leading-tight">
                      ✏️<br />Update
                    </button>
                    <button type="button" onClick={() => openModal('pickup', b)}
                      className="py-2.5 text-[9px] font-black bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 uppercase tracking-wide leading-tight">
                      📍<br />Pickup
                    </button>
                    <button type="button" onClick={() => openModal('drop', b)}
                      className="py-2.5 text-[9px] font-black bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-500 hover:text-white transition-all active:scale-95 uppercase tracking-wide leading-tight">
                      🏁<br />Drop
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredBookings.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-400 font-semibold text-sm">Try fetching or changing the filter.</p>
          </div>
        )}
      </div>

      {/* ── CHANGE STATUS MODAL ── */}
      {modal?.type === 'status' && (
        <Modal title="Change Status" subtitle={`Booking #${modal.booking.bookingId || modal.booking._id?.slice(-6)}`} onClose={closeModal}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Select New Status</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {STATUS_OPTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setStatusVal(s)}
                  className={`py-3 px-4 rounded-2xl text-sm font-black transition-all border-2 flex items-center gap-2 justify-center ${
                    statusVal === s ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                  }`}>
                  {STATUS_STYLE[s]?.icon} {s}
                </button>
              ))}
            </div>
            {statusVal === 'Cancelled' && (
              <Inp label="Cancellation Reason" placeholder="Why is this cancelled?" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            )}
            {error && <div className="bg-red-50 text-red-600 rounded-2xl px-4 py-3 text-sm font-semibold">{String(error)}</div>}
            {success && <div className="bg-green-50 text-green-700 rounded-2xl px-4 py-3 text-sm font-semibold">✓ {success}</div>}
            <button type="button" onClick={onChangeStatus} disabled={loading}
              className="w-full bg-zinc-900 text-white font-black py-4 rounded-2xl hover:bg-zinc-700 active:scale-[0.98] transition-all disabled:opacity-40">
              {loading ? 'Applying...' : 'Apply Status'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── CONFIRM BOOKING MODAL ── */}
      {modal?.type === 'confirm' && (
        <Modal title="Confirm Booking" subtitle="Assign driver and payment info" onClose={closeModal}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Driver ID" placeholder="Driver ID" value={confirmForm.assignedDriverId} onChange={(e) => uc('assignedDriverId', e.target.value)} />
              <Inp label="Driver Name" placeholder="Driver name" value={confirmForm.assignedDriverName} onChange={(e) => uc('assignedDriverName', e.target.value)} />
              <Sel label="Payment Status" value={String(confirmForm.isPaid)} onChange={(e) => uc('isPaid', e.target.value === 'true')}>
                <option value="false">Not Paid</option>
                <option value="true">Paid ✓</option>
              </Sel>
              <Inp label="Payment ID" placeholder="Optional" value={confirmForm.paymentId} onChange={(e) => uc('paymentId', e.target.value)} />
            </div>
            {error && <div className="bg-red-50 text-red-600 rounded-2xl px-4 py-3 text-sm font-semibold">{String(error)}</div>}
            {success && <div className="bg-green-50 text-green-700 rounded-2xl px-4 py-3 text-sm font-semibold">✓ {success}</div>}
            <button type="button" onClick={onConfirm} disabled={loading}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-40 shadow-lg shadow-blue-500/20">
              {loading ? 'Confirming...' : '✅ Confirm Booking'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── UPDATE BOOKING MODAL ── */}
      {modal?.type === 'update' && (
        <Modal title="Update Booking" subtitle="Edit passenger and assignment details" onClose={closeModal}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Mobile" value={updateForm.customerMobile} onChange={(e) => uu('customerMobile', e.target.value)} />
              <Inp label="Email" type="email" value={updateForm.customerEmail} onChange={(e) => uu('customerEmail', e.target.value)} />
              <Inp label="Booked By" value={updateForm.bookedBy} onChange={(e) => uu('bookedBy', e.target.value)} />
              <Sel label="Status" value={updateForm.bookingStatus} onChange={(e) => uu('bookingStatus', e.target.value)}>
                <option value="">— Select —</option>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </Sel>
              <Inp label="Driver ID" value={updateForm.assignedDriverId} onChange={(e) => uu('assignedDriverId', e.target.value)} />
              <Inp label="Driver Name" value={updateForm.assignedDriverName} onChange={(e) => uu('assignedDriverName', e.target.value)} />
              <Sel label="Paid?" value={updateForm.isPaid} onChange={(e) => uu('isPaid', e.target.value)}>
                <option value="">— Select —</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Sel>
              <Inp label="Payment ID" value={updateForm.paymentId} onChange={(e) => uu('paymentId', e.target.value)} />
              <Inp label="Cancel Reason" className="col-span-2" value={updateForm.cancellationReason} onChange={(e) => uu('cancellationReason', e.target.value)} />
            </div>
            {error && <div className="bg-red-50 text-red-600 rounded-2xl px-4 py-3 text-sm font-semibold">{String(error)}</div>}
            {success && <div className="bg-green-50 text-green-700 rounded-2xl px-4 py-3 text-sm font-semibold">✓ {success}</div>}
            <button type="button" onClick={onUpdate} disabled={loading}
              className="w-full bg-zinc-900 text-white font-black py-4 rounded-2xl hover:bg-zinc-700 active:scale-[0.98] transition-all disabled:opacity-40">
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── PICKUP CODE MODAL ── */}
      {modal?.type === 'pickup' && (
        <Modal title="Verify Pickup" subtitle={`Booking #${modal.booking.bookingId || modal.booking._id?.slice(-6)}`} onClose={closeModal}>
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 text-sm font-semibold text-emerald-700">
              Enter the 6-digit pickup code provided by the passenger to start the ride.
            </div>
            <Inp label="Pickup Code" placeholder="Enter pickup code..." value={pickupCode} onChange={(e) => setPickupCode(e.target.value)} />
            {error && <div className="bg-red-50 text-red-600 rounded-2xl px-4 py-3 text-sm font-semibold">{String(error)}</div>}
            {success && <div className="bg-green-50 text-green-700 rounded-2xl px-4 py-3 text-sm font-semibold">✓ {success}</div>}
            <button type="button" onClick={onVerifyPickup} disabled={loading}
              className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-40 shadow-lg shadow-emerald-500/20">
              {loading ? 'Verifying...' : '📍 Verify Pickup'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── DROP CODE MODAL ── */}
      {modal?.type === 'drop' && (
        <Modal title="Verify Drop" subtitle={`Booking #${modal.booking.bookingId || modal.booking._id?.slice(-6)}`} onClose={closeModal}>
          <div className="space-y-4">
            <div className="bg-violet-50 border border-violet-100 rounded-2xl px-5 py-4 text-sm font-semibold text-violet-700">
              Enter the 6-digit drop code to complete and close the ride.
            </div>
            <Inp label="Drop Code" placeholder="Enter drop code..." value={dropCode} onChange={(e) => setDropCode(e.target.value)} />
            {error && <div className="bg-red-50 text-red-600 rounded-2xl px-4 py-3 text-sm font-semibold">{String(error)}</div>}
            {success && <div className="bg-green-50 text-green-700 rounded-2xl px-4 py-3 text-sm font-semibold">✓ {success}</div>}
            <button type="button" onClick={onVerifyDrop} disabled={loading}
              className="w-full bg-violet-600 text-white font-black py-4 rounded-2xl hover:bg-violet-700 active:scale-[0.98] transition-all disabled:opacity-40 shadow-lg shadow-violet-600/20">
              {loading ? 'Verifying...' : '🏁 Verify Drop'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
