import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { BaseUrl } from '../../utils/baseUrl'

// 1. Add Car
export const addCar = createAsyncThunk(
  'cars/addCar',
  async (carData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/travel/add-a-car`, carData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 2. Get Car By Id
export const getCarById = createAsyncThunk(
  'cars/getCarById',
  async (carId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/travel/get-a-car/${carId}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 3. Get My Cars (auth)
export const getMyCars = createAsyncThunk(
  'cars/getMyCars',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token =
        getState().auth?.user?.token || localStorage.getItem('loggedUserToken')
      const res = await axios.get(`${BaseUrl}/travel/get-my-cars`, {
        headers: { Authorization: token },
      })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 4. Get Cars By Owner Id
export const getCarsByOwner = createAsyncThunk(
  'cars/getCarsByOwner',
  async (ownerId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/travel/get-a-car/by-owner/${ownerId}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 5. Get All Cars
export const getAllCars = createAsyncThunk(
  'cars/getAllCars',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/travel/get-all-car`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 6. Update Car
export const updateCar = createAsyncThunk(
  'cars/updateCar',
  async ({ carId, carData }, { getState, rejectWithValue }) => {
    try {
      const token =
        getState().auth?.user?.token || localStorage.getItem('loggedUserToken')
      const res = await axios.patch(`${BaseUrl}/travel/update-a-car/${carId}`, carData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: token },
      })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 7. Delete Car
export const deleteCar = createAsyncThunk(
  'cars/deleteCar',
  async (carId, { getState, rejectWithValue }) => {
    try {
      const token =
        getState().auth?.user?.token || localStorage.getItem('loggedUserToken')
      const res = await axios.delete(`${BaseUrl}/travel/delete-a-car/${carId}`, {
        headers: { Authorization: token },
      })
      return { ...res.data, carId }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 8. Filter Cars
export const filterCars = createAsyncThunk(
  'cars/filterCars',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString()
      const res = await axios.get(`${BaseUrl}/travel/filter-car/by-query?${params}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

// 9. Get Seat Data By Car Id
export const getSeatData = createAsyncThunk(
  'cars/getSeatData',
  async (carId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/travel/get-seat-data/by-id/${carId}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  },
)

const carSlice = createSlice({
  name: 'cars',
  initialState: {
    cars: [],
    car: null,
    seatData: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearCarError(state) {
      state.error = null
    },
    clearCar(state) {
      state.car = null
    },
    clearSeatData(state) {
      state.seatData = null
    },
    clearCarSuccess(state) {
      state.success = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addCar.fulfilled, (state, action) => {
        state.loading = false
        state.success = action.payload?.message || 'Car added'
        const car = action.payload?.car
        if (car) state.cars.push(car)
      })
      .addCase(getCarById.fulfilled, (state, action) => {
        state.loading = false
        state.car = action.payload
      })
      .addCase(getMyCars.fulfilled, (state, action) => {
        state.loading = false
        state.cars = action.payload || []
      })
      .addCase(getCarsByOwner.fulfilled, (state, action) => {
        state.loading = false
        state.cars = action.payload || []
      })
      .addCase(getAllCars.fulfilled, (state, action) => {
        state.loading = false
        state.cars = action.payload || []
      })
      .addCase(updateCar.fulfilled, (state, action) => {
        state.loading = false
        state.success = action.payload?.message || 'Car updated'
        const updated = action.payload?.car
        if (updated) {
          state.cars = state.cars.map((c) =>
            c._id === updated._id ? { ...c, ...updated } : c,
          )
        }
      })
      .addCase(deleteCar.fulfilled, (state, action) => {
        state.loading = false
        state.success = action.payload?.message || 'Car deleted'
        state.cars = state.cars.filter((c) => c._id !== action.payload.carId)
      })
      .addCase(filterCars.fulfilled, (state, action) => {
        state.loading = false
        state.cars = action.payload || []
      })
      .addCase(getSeatData.fulfilled, (state, action) => {
        state.loading = false
        state.seatData = action.payload
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('cars/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true
          state.error = null
          state.success = null
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('cars/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false
          state.error = action.payload
        },
      )
  },
})

export const { clearCarError, clearCar, clearSeatData, clearCarSuccess } = carSlice.actions
export default carSlice.reducer