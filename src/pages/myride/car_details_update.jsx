import React, { useEffect, useMemo, useState } from "react";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { FaLocationArrow, FaTimes } from "react-icons/fa";
import { PhotoCamera, Speed, DirectionsCar, LocalGasStation, Settings, EventSeat, Palette, CalendarToday } from "@mui/icons-material";
import { baseUrl } from "../../../baseUrl";

const initialFormData = {
  make: "",
  model: "",
  year: "",
  vehicleNumber: "",
  price: "",
  pickupP: "",
  dropP: "",
  sharingType: "",
  vehicleType: "",
  pickupD: "",
  dropD: "",
  perPersonCost: "",
  seater: "",
  extraKm: "",
  color: "",
  mileage: "",
  fuelType: "",
  transmission: "",
  isAvailable: true,
};

const formatDateTimeForInput = (dateString) => {
  if (!dateString || typeof dateString !== "string") return "";
  return dateString.slice(0, 16);
};

export default function CarUpdate({ car, onClose, open, onUpdateSuccess = () => {} }) {
  const [formData, setFormData] = useState(initialFormData);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [allCarData, setAllCarData] = useState([]);
  const [makes, setMakes] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  const abortControllerRef = React.useRef(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const response = await fetch(
          "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?limit=100"
        );
        const data = await response.json();
        const carResults = data.results || [];
        setAllCarData(carResults);
        const uniqueMakes = [...new Set(carResults.map((c) => c.make))].sort();
        setMakes(uniqueMakes);
      } catch (err) {
        console.error("Error fetching car data:", err);
        setError("Failed to load car data");
      }
    };
    fetchCarData();
  }, []);

  useEffect(() => {
    if (car) {
      setFormData({
        make: car.make || "",
        model: car.model || "",
        year: car.year || "",
        vehicleNumber: car.vehicleNumber || "",
        price: car.price || "",
        pickupP: car.pickupP || "",
        dropP: car.dropP || "",
        pickupD: formatDateTimeForInput(car.pickupD),
        dropD: formatDateTimeForInput(car.dropD),
        perPersonCost: car.perPersonCost || "",
        seater: car.seater || "",
        sharingType: car.sharingType || "",
        vehicleType: car.vehicleType || "",
        extraKm: car.extraKm || "",
        color: car.color || "",
        mileage: car.mileage || "",
        fuelType: car.fuelType || "",
        transmission: car.transmission || "",
        isAvailable: car.isAvailable !== undefined ? car.isAvailable : true,
      });
      setImagePreviews(car.images || []);
      setImages([]);
    }
  }, [car]);

  const filteredModels = useMemo(() => {
    if (!formData.make) return [];
    const modelsForMake = allCarData
      .filter((c) => c.make === formData.make)
      .map(c => c.model);
    return [...new Set(modelsForMake)].sort();
  }, [formData.make, allCarData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
        const newState = { ...prev, [name]: value };
        if (name === "make") {
            newState.model = '';
        }
        return newState;
    });
    if (success) setSuccess("");
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    imagePreviews.forEach((preview) => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const dataToSubmit = { ...formData };
      if (dataToSubmit.pickupD) {
        dataToSubmit.pickupD = new Date(dataToSubmit.pickupD).toISOString();
      }
      if (dataToSubmit.dropD) {
        dataToSubmit.dropD = new Date(dataToSubmit.dropD).toISOString();
      }
      const submissionData = new FormData();
      Object.entries(dataToSubmit).forEach(([key, value]) => {
        submissionData.append(key, value);
      });
      if (images.length > 0) {
        images.forEach((file) => {
          submissionData.append("images", file);
        });
      }
      const response = await fetch(`${baseUrl}/travel/update-a-car/${car._id}`, {
        method: "PATCH",
        body: submissionData,
        signal: abortControllerRef.current.signal,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      const result = await response.json();
      setSuccess("Car details updated successfully!");
      onUpdateSuccess(result);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error updating car:", err);
        setError(err.message || "Failed to update car details");
      }
    } finally {
      setLoading(false);
    }
  };

  const FormInput = ({ label, icon: Icon, children, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center text-sm font-semibold text-gray-700 gap-2">
        {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
        {label}
      </label>
      {children}
    </div>
  );

  const SectionCard = ({ title, icon: Icon, children, isActive = false }) => (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 ${
      isActive ? 'border-indigo-200 shadow-md' : 'border-gray-100 hover:border-gray-200'
    }`}>
      <div className="p-4 border-b border-gray-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 gap-2">
          <Icon className="w-5 h-5 text-indigo-600" />
          {title}
        </h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <DirectionsCar className="w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-bold">Update Car Details</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Progress/Section Navigation */}
        <div className="bg-white px-4 sm:px-6 py-3 border-b border-gray-200">
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              { key: 'basic', label: 'Basic Info', icon: DirectionsCar },
              { key: 'specs', label: 'Specifications', icon: Settings },
              { key: 'pricing', label: 'Pricing & Schedule', icon: FaIndianRupeeSign },
              { key: 'images', label: 'Images', icon: PhotoCamera }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === key
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {(success || error) && (
          <div className="px-4 sm:px-6 py-3">
            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Information Section */}
            {activeSection === 'basic' && (
              <SectionCard title="Basic Information" icon={DirectionsCar} isActive>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <FormInput label="Make" icon={DirectionsCar}>
                    <select
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">Select Make</option>
                      {makes.map((m, i) => (
                        <option key={i} value={m}>{m}</option>
                      ))}
                    </select>
                  </FormInput>

                  <FormInput label="Model">
                    <select
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      disabled={!formData.make || filteredModels.length === 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Model</option>
                      {filteredModels.map((m, i) => (
                        <option key={i} value={m}>{m}</option>
                      ))}
                    </select>
                  </FormInput>

                  <FormInput label="Year" icon={CalendarToday}>
                    <input
                      name="year"
                      type="number"
                      placeholder="Enter year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </FormInput>

                  <FormInput label="Vehicle Number">
                    <input
                      name="vehicleNumber"
                      placeholder="Enter vehicle number"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </FormInput>

                  <FormInput label="Color" icon={Palette}>
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">Select Color</option>
                      {["Red", "Blue", "Black", "White", "Silver", "Green", "Gray", "Brown"].map((clr) => (
                        <option key={clr} value={clr}>{clr}</option>
                      ))}
                    </select>
                  </FormInput>

                  <FormInput label="Vehicle Type">
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">Select Vehicle Type</option>
                      {["Car", "Bike", "Bus", "SUV", "Hatchback", "Sedan"].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </FormInput>
                </div>
              </SectionCard>
            )}

            {/* Specifications Section */}
            {activeSection === 'specs' && (
              <SectionCard title="Specifications" icon={Settings} isActive>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <FormInput label="Seater Capacity" icon={EventSeat}>
                    <select
                      name="seater"
                      value={formData.seater}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">Select Seater</option>
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                        <option key={s} value={s}>{s} Seater</option>
                      ))}
                    </select>
                  </FormInput>

                  <FormInput label="Fuel Type" icon={LocalGasStation}>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">Select Fuel Type</option>
                      {["Petrol", "Diesel", "Electric", "Hybrid", "CNG"].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </FormInput>

                  <FormInput label="Transmission" icon={Settings}>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">Select Transmission</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </FormInput>

                  <FormInput label="Mileage (KM/L)" icon={Speed}>
                    <input
                      name="mileage"
                      type="number"
                      placeholder="Enter mileage"
                      value={formData.mileage}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </FormInput>

                  <FormInput label="Sharing Type">
                    <select
                      name="sharingType"
                      value={formData.sharingType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">Select Sharing Type</option>
                      {["Private", "Shared"].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </FormInput>

                  <FormInput label="Extra KM Charge">
                    <input
                      name="extraKm"
                      placeholder="Enter extra KM charge"
                      value={formData.extraKm}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </FormInput>
                </div>
              </SectionCard>
            )}

            {/* Pricing & Schedule Section */}
            {activeSection === 'pricing' && (
              <SectionCard title="Pricing & Schedule" icon={FaIndianRupeeSign} isActive>
                <div className="space-y-6">
                  {/* Pricing */}
                  <div>
                
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <FormInput label="Full Ride Price" icon={FaIndianRupeeSign}>
                        <input
                          name="price"
                          type="number"
                          placeholder="Enter full ride price"
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </FormInput>

                      <FormInput label="Per Person Cost" icon={FaIndianRupeeSign}>
                        <input
                          name="perPersonCost"
                          type="number"
                          placeholder="Enter per person cost"
                          value={formData.perPersonCost}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </FormInput>
                    </div>
                  </div>

                  {/* Locations */}
                  <div>
                   
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <FormInput label="Pickup Location" icon={FaLocationArrow}>
                        <input
                          name="pickupP"
                          placeholder="Enter pickup location"
                          value={formData.pickupP}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </FormInput>

                      <FormInput label="Drop Location" icon={FaLocationArrow}>
                        <input
                          name="dropP"
                          placeholder="Enter drop location"
                          value={formData.dropP}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </FormInput>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                   
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <FormInput label="Pickup Date & Time" icon={CalendarToday}>
                        <input
                          type="datetime-local"
                          name="pickupD"
                          value={formData.pickupD}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </FormInput>

                      <FormInput label="Drop Date & Time" icon={CalendarToday}>
                        <input
                          type="datetime-local"
                          name="dropD"
                          value={formData.dropD}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </FormInput>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Images Section */}
            {activeSection === 'images' && (
              <SectionCard title="Vehicle Images" icon={PhotoCamera} isActive>
                <div className="space-y-6">
                  <FormInput label="Upload New Images">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl px-6 py-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 group">
                      <PhotoCamera className="w-12 h-12 text-gray-400 group-hover:text-indigo-500 mb-3" />
                      <span className="text-lg font-medium text-indigo-600 group-hover:text-indigo-700">
                        Choose Images
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        PNG, JPG up to 10MB each
                      </span>
                      <input 
                        type="file" 
                        hidden 
                        accept="image/*" 
                        multiple 
                        onChange={handleFileChange} 
                      />
                    </label>
                  </FormInput>

                  {imagePreviews.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Image Preview ({imagePreviews.length} images)
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 sm:h-32 object-cover rounded-xl shadow-md border hover:shadow-lg transition-all duration-200"
                            />
                            <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                Image {index + 1}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Action Buttons */}
            <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4 sticky bottom-0">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                <div className="flex gap-2 text-sm text-gray-600">
                  <span className="hidden sm:inline">Section:</span>
                  <span className="font-medium capitalize">{activeSection}</span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <DirectionsCar className="w-5 h-5" />
                        Update
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
