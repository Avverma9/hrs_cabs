import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../../../baseUrl';
import { userId } from '../../../util/configs';

// --- Helper Components ---

const FormSection = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const Input = ({ label, name, value, onChange, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      {...props}
    />
  </div>
);

const Select = ({ label, name, value, onChange, children }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      {children}
    </select>
  </div>
);

const ConfirmationDialog = ({ open, onClose, onConfirm, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="mt-2 text-sm text-gray-600">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

// --- Main AddCar Component ---

export default function AddCar() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    make: '', model: '', year: '', vehicleNumber: '', color: '',
    sharingType: 'Shared', vehicleType: 'Sedan',
    fuelType: 'Petrol', transmission: 'Manual', mileage: '', seater: '4',
    price: '', perPersonCost: '', extraKm: '',
    pickupP: '', dropP: '', pickupD: '', dropD: '',
    runningStatus: 'Available', isAvailable: true,
    images: [],
  });

  const [allCarData, setAllCarData] = useState([]);
  const [makes, setMakes] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [seatConfig, setSeatConfig] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => navigate(-1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, images: [...e.target.files] }));
    }
  };

  useEffect(() => {
    if (formData.sharingType === 'Shared') {
      const numSeats = parseInt(formData.seater, 10) || 0;
      setSeatConfig(Array.from({ length: numSeats }, (_, i) => ({
        seatType: "AC", seatNumber: `S${i + 1}`, seatPrice: "", isBooked: false, bookedBy: "",
      })));
    } else {
      setSeatConfig([]);
    }
  }, [formData.sharingType, formData.seater]);

  const handleSeatChange = (index, field, value) => {
    const updatedSeats = [...seatConfig];
    const seat = { ...updatedSeats[index] };
    seat[field] = value;
    updatedSeats[index] = seat;
    setSeatConfig(updatedSeats);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenDialog(true);
  };

  const handleDialogConfirm = async () => {
    setOpenDialog(false);
    setIsSubmitting(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'images') {
        for (let i = 0; i < value.length; i++) {
          data.append('images', value[i]);
        }
      } else {
        data.append(key, value);
      }
    });

    if (formData.sharingType === 'Shared') {
      data.append('seatConfig', JSON.stringify(seatConfig));
    }

    data.append("ownerId", userId);

    try {
      const response = await fetch(`${baseUrl}/travel/add-a-car`, {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add car');
      }

      const responseData = await response.json();
      alert('Car added successfully!'); // Replace with a better notification system
      navigate("/home"); // Navigate to a relevant page after success

    } catch (error) {
      console.error("Error creating car:", error);
      alert(`Error: ${error.message}`); // Replace with a better notification system
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const response = await fetch("https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?limit=100");
        const data = await response.json();
        const carData = data.results || [];
        setAllCarData(carData);
        const uniqueMakes = [...new Set(carData.map((car) => car.make))].sort();
        setMakes(uniqueMakes);
      } catch (err) {
        console.error("Error fetching car data:", err);
      }
    };
    fetchCarData();
  }, []);

  useEffect(() => {
    if (formData.make) {
      const models = allCarData
        .filter((car) => car.make === formData.make)
        .map(car => car.model)
        .sort();
      setFilteredModels([...new Set(models)]);
    } else {
      setFilteredModels([]);
    }
  }, [formData.make, allCarData]);

  return (
    <div className="bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <button onClick={handleBack} className="text-sm font-medium text-blue-600 hover:underline mb-4">&larr; Back to Dashboard</button>
          <h1 className="text-3xl font-bold text-gray-900">Add a New Vehicle</h1>
          <p className="text-gray-600 mt-1">Fill in the details to add a new car to your fleet.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection title="Vehicle Information">
            <Select label="Make" name="make" value={formData.make} onChange={handleInputChange}>
              <option value="">Select Make</option>
              {makes.map(make => <option key={make} value={make}>{make}</option>)}
            </Select>
            <Select label="Model" name="model" value={formData.model} onChange={handleInputChange} disabled={!formData.make}>
              <option value="">Select Model</option>
              {filteredModels.map(model => <option key={model} value={model}>{model}</option>)}
            </Select>
            <Input label="Year" name="year" type="number" value={formData.year} onChange={handleInputChange} placeholder="e.g., 2022" />
            <Input label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} placeholder="e.g., MH 12 AB 1234" />
            <Input label="Color" name="color" value={formData.color} onChange={handleInputChange} placeholder="e.g., White" />
            <Select label="Vehicle Type" name="vehicleType" value={formData.vehicleType} onChange={handleInputChange}>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
            </Select>
          </FormSection>

          <FormSection title="Specifications">
            <Select label="Fuel Type" name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="CNG">CNG</option>
            </Select>
            <Select label="Transmission" name="transmission" value={formData.transmission} onChange={handleInputChange}>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </Select>
            <Input label="Mileage (km/l)" name="mileage" type="number" value={formData.mileage} onChange={handleInputChange} placeholder="e.g., 20" />
            <Input label="Seater" name="seater" type="number" value={formData.seater} onChange={handleInputChange} placeholder="e.g., 4" />
          </FormSection>

          <FormSection title="Ride & Pricing Details">
            <Select label="Sharing Type" name="sharingType" value={formData.sharingType} onChange={handleInputChange}>
              <option value="Shared">Shared</option>
              <option value="Private">Private</option>
            </Select>
            {formData.sharingType === 'Private' ? (
              <Input label="Total Price (₹)" name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="e.g., 3000" />
            ) : (
              <Input label="Per Person Cost (₹)" name="perPersonCost" type="number" value={formData.perPersonCost} onChange={handleInputChange} placeholder="e.g., 800" />
            )}
            <Input label="Extra Km Charge (₹)" name="extraKm" type="number" value={formData.extraKm} onChange={handleInputChange} placeholder="e.g., 15" />
          </FormSection>

          {formData.sharingType === 'Shared' && (
            <FormSection title="Seat Configuration">
              {seatConfig.map((seat, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4 col-span-full">
                  <Input label={`Seat ${index + 1} Number`} name="seatNumber" value={seat.seatNumber} onChange={(e) => handleSeatChange(index, 'seatNumber', e.target.value)} />
                  <Select label="Seat Type" name="seatType" value={seat.seatType} onChange={(e) => handleSeatChange(index, 'seatType', e.target.value)}>
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                  </Select>
                  <Input label="Seat Price (₹)" name="seatPrice" type="number" value={seat.seatPrice} onChange={(e) => handleSeatChange(index, 'seatPrice', e.target.value)} />
                </div>
              ))}
            </FormSection>
          )}

          <FormSection title="Route & Schedule">
            <Input label="Pickup Point" name="pickupP" value={formData.pickupP} onChange={handleInputChange} placeholder="e.g., Mumbai" />
            <Input label="Drop Point" name="dropP" value={formData.dropP} onChange={handleInputChange} placeholder="e.g., Pune" />
            <Input label="Pickup Date & Time" name="pickupD" type="datetime-local" value={formData.pickupD} onChange={handleInputChange} />
            <Input label="Drop Date & Time" name="dropD" type="datetime-local" value={formData.dropD} onChange={handleInputChange} />
          </FormSection>

          <FormSection title="Media">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
              <input type="file" name="images" multiple onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </FormSection>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button type="button" onClick={handleBack} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300">
              {isSubmitting ? 'Submitting...' : 'Add Car'}
            </button>
          </div>
        </form>

        <ConfirmationDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onConfirm={handleDialogConfirm}
          title="Confirm Vehicle Addition"
        >
          Are you sure you want to add this vehicle to your fleet?
        </ConfirmationDialog>
      </div>
    </div>
  );
}