import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Divider,
  Grid,
  TextField,
  Typography,
  Container,
  Card,
  CardHeader,
  CardContent,
  Button, // Keep Button for the UI
} from "@mui/material";

import { fetchTravelBookingsTMS } from "../redux/reducers/travel/booking";
import TravelBookingsTable from "./bookings-table";
import { useLoader } from "../../../utils/loader";
import { userId } from "../../../utils/util";

export default function MyRideBooking() {
  // --- YOUR ORIGINAL STATE AND LOGIC ---
  const dispatch = useDispatch();
  const [bookingIdSearch, setBookingIdSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { showLoader, hideLoader } = useLoader();

  const { bookingsTMS, loading, error } = useSelector(
    (state) => state.travelBooking
  );

  // --- YOUR ORIGINAL FILTERING LOGIC - UNCHANGED ---
  const filteredBookings = (bookingsTMS || []).filter((booking) => {
    const matchesBookingId = booking.bookingId
      .toLowerCase()
      .includes(bookingIdSearch.toLowerCase());

    const pickupTime = new Date(booking.pickupD).getTime();
    const dropTime = new Date(booking.dropD).getTime();
    const fromTime = fromDate ? new Date(fromDate).getTime() : null;
    const toTime = toDate ? new Date(toDate).getTime() : null;

    const isWithinDateRange =
      (!fromTime || dropTime >= fromTime) &&
      (!toTime || pickupTime <= toTime);

    return matchesBookingId && isWithinDateRange;
  });

  // --- YOUR ORIGINAL useEffect - UNCHANGED ---
  useEffect(() => {
    const loadBookings = async () => {
      if (!bookingsTMS || bookingsTMS.length === 0) {
        showLoader();
        try {
          await dispatch(fetchTravelBookingsTMS(userId)).unwrap();
        } catch (err) {
          console.error("Failed to fetch bookings:", err);
        } finally {
          hideLoader();
        }
      }
    };

    loadBookings();
  }, [dispatch, bookingsTMS]);


  // --- NEW: Function to handle the export logic using only native JS ---
  const handleExport = () => {
    if (filteredBookings.length === 0) {
      alert("No data to export.");
      return;
    }

    // Define headers for your CSV file.
    // This makes sure the columns are in the order you want.
    const headers = [
        "Booking ID", "Pickup Date", "Drop Date", "Status", 
        "Source", "Destination" /* Add other headers as needed */
    ];
    
    // This function handles values that might contain commas or quotes
    const escapeCsvCell = (cell) => {
        if (cell == null) { // Handle null or undefined
            return '';
        }
        const strCell = String(cell);
        if (strCell.includes(',') || strCell.includes('"') || strCell.includes('\n')) {
            // Wrap in double quotes and escape existing double quotes
            return `"${strCell.replace(/"/g, '""')}"`;
        }
        return strCell;
    };
    
    // Map your booking data to match the header order
    const dataRows = filteredBookings.map(booking => [
        booking.bookingId,
        booking.pickupD, // Assuming these are the correct field names
        booking.dropD,
        booking.status,
        booking.source,
        booking.destination
        /* Add other booking fields in the same order as headers */
    ].map(escapeCsvCell).join(','));

    // Combine headers and data rows
    const csvContent = [headers.join(','), ...dataRows].join('\n');

    // Create a Blob and trigger the download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'filtered_bookings.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    // The rest of your component remains exactly the same
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardHeader
          title="My Travel Bookings"
          subheader={`Displaying ${filteredBookings.length} bookings`}
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search by Booking ID"
                variant="outlined"
                size="small"
                value={bookingIdSearch}
                onChange={(e) => setBookingIdSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="From Date (Pickup/Drop)"
                type="datetime-local"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="To Date (Pickup/Drop)"
                type="datetime-local"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleExport}
                disabled={filteredBookings.length === 0}
              >
                Export as CSV
              </Button>
            </Grid>
          </Grid>

          {loading && <Typography sx={{ textAlign: 'center', p: 2 }}>Loading bookings...</Typography>}
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              Error: {error}
            </Typography>
          )}

          <TravelBookingsTable
            bookings={filteredBookings}
          />

        </CardContent>
      </Card>
    </Container>
  );
}