import { combineReducers } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import carReducer from './slices/carSlice'
import bookingReducer from './slices/bookingSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  cars: carReducer,
  bookings: bookingReducer,
})

export default rootReducer

