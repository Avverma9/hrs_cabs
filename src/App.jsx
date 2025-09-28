
import './App.css'
import Footer from './components/footer';
import Header from './components/header';
import Login from './components/login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyRide from './pages/myride/my_ride';

function App() {

  return (
    <> <Header/>
      <Router>
       
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path='/home' element={<MyRide/>}/>
        </Routes>
        <Footer/>
      </Router>
    </>
  )
}

export default App
