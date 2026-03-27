import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { BaseUrl } from '../../utils/baseUrl'

// 10. Create Travel Booking
export const createTravelBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/travel/create-travel/booking`, bookingData)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 11. Change Booking Status
export const changeBookingStatus = createAsyncThunk(
  'bookings/changeStatus',
  async ({ bookingId, statusData }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BaseUrl}/travel/change-booking-status/${bookingId}`,
        statusData,
      )
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 12. Get All Travel Bookings
export const getAllBookings = createAsyncThunk(
  'bookings/getAllBookings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/travel/get-travels-bookings`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 13. Update Booking
export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${BaseUrl}/travel/update-travel/booking`, { id, data })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 13A. Confirm Booking
export const confirmBooking = createAsyncThunk(
  'bookings/confirmBooking',
  async ({ bookingId, confirmData }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BaseUrl}/travel/confirm-booking/${bookingId}`,
        confirmData,
      )
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 13B. Verify Pickup Code
export const verifyPickupCode = createAsyncThunk(
  'bookings/verifyPickupCode',
  async ({ bookingId, pickupCode }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BaseUrl}/travel/verify-pickup-code/${bookingId}`,
        { pickupCode },
      )
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 13C. Verify Drop Code
export const verifyDropCode = createAsyncThunk(
  'bookings/verifyDropCode',
  async ({ bookingId, dropCode }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BaseUrl}/travel/verify-drop-code/${bookingId}`,
        { dropCode },
      )
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 14. Get Bookings By Owner
export const getBookingsByOwner = createAsyncThunk(
  'bookings/getBookingsByOwner',
  async (ownerId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/travel/get-bookings-by/owner/${ownerId}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 15. Get Bookings By Mobile
export const getBookingsByMobile = createAsyncThunk(
  'bookings/getBookingsByMobile',
  async (mobile, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/travel/get-bookings-by/bookedBy`, {
        customerMobile: mobile,
      })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 16. Get Bookings By User Id
export const getBookingsByUserId = createAsyncThunk(
  'bookings/getBookingsByUserId',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/travel/get-bookings-by/user/${userId}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    booking: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearBookingError(state) {
      state.error = null
    },
    clearBooking(state) {
      state.booking = null
    },
    clearBookings(state) {
      state.bookings = []
    },
    clearBookingSuccess(state) {
      state.success = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTravelBooking.fulfilled, (state, action) => {
        state.loading = false
        state.booking = action.payload?.data || action.payload
        state.success = action.payload?.message || 'Booking created'
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload || []
      })
      .addCase(getBookingsByUserId.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload || []
      })
      .addCase(getBookingsByMobile.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload || []
      })
      .addCase(getBookingsByOwner.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload || []
      })
      .addCase(changeBookingStatus.fulfilled, (state, action) => {
        state.loading = false
        state.success = action.payload?.message || 'Status updated'
        const updated = action.payload?.booking
        if (updated) {
          state.bookings = state.bookings.map((b) =>
            b._id === updated._id ? { ...b, ...updated } : b,
          )
        }
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false
        state.success = action.payload?.message || 'Booking updated'
        const updated = action.payload?.booking
        if (updated) {
          state.bookings = state.bookings.map((b) =>
            b._id === updated._id ? { ...b, ...updated } : b,
          )
        }
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.loading = false
        state.success = action.payload?.message || 'Booking confirmed'
        const updated = action.payload?.booking
        if (updated) {
          state.bookings = state.bookings.map((b) =>
            b._id === updated._id ? { ...b, ...updated } : b,
          )
        }
      })
      .addCase(verifyPickupCode.fulfilled, (state, action) => {
        state.loading = false
        state.success = action.payload?.message || 'Pickup verified'
        const updated = action.payload?.booking
        if (updated) {
          state.bookings = state.bookings.map((b) =>
            b._id === updated._id ? { ...b, ...updated } : b,
          )
        }
      })
      .addCase(verifyDropCode.fulfilled, (state, action) => {
        state.loading = false
        state.success = action.payload?.message || 'Drop verified'
        const updated = action.payload?.booking
        if (updated) {
          state.bookings = state.bookings.map((b) =>
            b._id === updated._id ? { ...b, ...updated } : b,
          )
        }
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('bookings/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true
          state.error = null
          state.success = null
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('bookings/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false
          state.error = action.payload
        },
      )
  },
})

export const { clearBookingError, clearBooking, clearBookings, clearBookingSuccess } =
  bookingSlice.actions
export default bookingSlice.reducer
