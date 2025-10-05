import './App.css'
import { createBrowserRouter, RouterProvider, useNavigation } from 'react-router-dom';
import Footer from './components/footer';
import Header from './components/header';
import Login from './components/login';
import MyRide from './pages/myride/my_ride';
import MyRideBooking from './pages/bookings/my_bookings.jsx';
import AddCar from './pages/myride/add_car.jsx';
import Loader from './components/loader.jsx';

function MainLayout({ children }) {
  const navigation = useNavigation();
  return (
    <>
      {navigation.state === 'loading' && <Loader />}
      <Header />
      <main className="pt-16"> {/* Add padding to avoid content being hidden by fixed header */}
        {children}
      </main>
      <Footer />
    </>
  );
}

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/", element: <MainLayout><MyRide /></MainLayout> },
  { path: "/home", element: <MainLayout><MyRide /></MainLayout> },
  { path: "/add-car", element: <MainLayout><AddCar /></MainLayout> },
  { path: "/bookings", element: <MainLayout><MyRideBooking /></MainLayout> },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
