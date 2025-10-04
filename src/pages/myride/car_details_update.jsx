import React, { useEffect, useMemo, useState } from "react";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { FaLocationArrow } from "react-icons/fa";
import { PhotoCamera, Speed } from "@mui/icons-material";
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
        const uniqueMakes = [...new Set(carResults.map((c) => c.make))];
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
    return allCarData.filter((c) => c.make === formData.make);
  }, [formData.make, allCarData]);

  const modelOptions = useMemo(
    () => [...new Set(filteredModels.map((c) => c.model))],
    [filteredModels]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      if (onUpdateSuccess) {
        onUpdateSuccess(result);
      }
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl overflow-y-auto max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-indigo-600">Update Car Details</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-full border border-indigo-500 text-indigo-600 font-semibold hover:bg-indigo-50"
          >
            Close
          </button>
        </div>

        {/* Alerts */}
        <div className="px-6 mt-3">
          {success && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-md font-medium mb-3">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md font-medium mb-3">
              {error}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Make */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Make</label>
            <input
              name="make"
              value={formData.make}
              onChange={handleChange}
              placeholder="Make"
              className="border rounded-lg px-3 py-2 w-full focus:ring focus:ring-indigo-300"
              list="makes"
            />
            <datalist id="makes">
              {makes.map((m, i) => (
                <option key={i} value={m} />
              ))}
            </datalist>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Model</label>
            <input
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Model"
              className="border rounded-lg px-3 py-2 w-full focus:ring focus:ring-indigo-300"
              list="models"
            />
            <datalist id="models">
              {modelOptions.map((m, i) => (
                <option key={i} value={m} />
              ))}
            </datalist>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
            <input
              name="year"
              type="number"
              placeholder="Year"
              value={formData.year}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Car Number</label>
            <input
              name="vehicleNumber"
              placeholder="Car Number"
              value={formData.vehicleNumber}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
            <select
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Select Color</option>
              {["Red", "Blue", "Black", "White", "Silver", "Green"].map((clr) => (
                <option key={clr} value={clr}>
                  {clr}
                </option>
              ))}
            </select>
          </div>

          {/* Seater */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Seater</label>
            <select
              name="seater"
              value={formData.seater}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Select Seater</option>
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fuel Type</label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Fuel Type</option>
              {["Petrol", "Diesel", "Electric", "Hybrid"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Type</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Vehicle Type</option>
              {["Car", "Bike", "Bus"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Sharing Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sharing Type</label>
            <select
              name="sharingType"
              value={formData.sharingType}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Sharing Type</option>
              {["Private", "Shared"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Transmission</label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mileage (KM/L)</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Speed className="text-gray-500 mr-2" />
              <input
                name="mileage"
                type="number"
                placeholder="Mileage (KM/L)"
                value={formData.mileage}
                onChange={handleChange}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Pickup Location</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaLocationArrow className="text-gray-500 mr-2" />
              <input
                name="pickupP"
                placeholder="Pickup Location"
                value={formData.pickupP}
                onChange={handleChange}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Drop Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Drop Location</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaLocationArrow className="text-gray-500 mr-2" />
              <input
                name="dropP"
                placeholder="Drop Location"
                value={formData.dropP}
                onChange={handleChange}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Pickup DateTime */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Pickup Date & Time</label>
            <input
              type="datetime-local"
              name="pickupD"
              value={formData.pickupD}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>

          {/* Drop DateTime */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Drop Date & Time</label>
            <input
              type="datetime-local"
              name="dropD"
              value={formData.dropD}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>

          {/* Full Ride Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Ride Price</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaIndianRupeeSign className="text-gray-500 mr-2" />
              <input
                name="price"
                type="number"
                placeholder="Full Ride Price"
                value={formData.price}
                onChange={handleChange}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Per Person Cost */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Per Person Cost</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaIndianRupeeSign className="text-gray-500 mr-2" />
              <input
                name="perPersonCost"
                type="number"
                placeholder="Per Person Cost"
                value={formData.perPersonCost}
                onChange={handleChange}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Extra KM Charge */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Extra KM Charge</label>
            <input
              name="extraKm"
              placeholder="Extra KM Charge"
              value={formData.extraKm}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>

          {/* Image Upload */}
          <div className="col-span-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload New Images</label>
            <label className="flex items-center justify-center border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer text-indigo-600 hover:bg-indigo-50">
              <PhotoCamera className="mr-2" />
              <span>Choose Images</span>
              <input type="file" hidden accept="image/*" multiple onChange={handleFileChange} />
            </label>
            {imagePreviews.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {imagePreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index}`}
                    className="w-24 h-24 object-cover rounded-xl shadow-md border hover:scale-105 transition"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="col-span-full mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              {loading ? "Updating..." : "Update Car"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
