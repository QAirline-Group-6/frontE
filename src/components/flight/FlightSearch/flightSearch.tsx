"use client"; // Required for client-side interactivity

import { useState } from "react";
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { GoArrowSwitch, GoArrowRight } from "react-icons/go";
import { useRouter } from "next/navigation";
import AirportInput from "../../airportInput/airportInput";
import styles from "./flightSearch.module.scss";
import flightService from "@/api/services/flightService";
import { toast } from "react-toastify";

type TripType = "round-trip" | "one-way";
type ApiTripType = "roundTrip" | "oneWay";

const FlightSearch = () => {
  const router = useRouter();
  const [tripType, setTripType] = useState<TripType>("round-trip");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    departDate: "",
    returnDate: "",
    adults: 1,
    children: 0,
  });

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle airport inputs - CẢI THIỆN XỬ LÝ AIRPORT CODE
    if (name === "from" || name === "to") {
      // Store the raw input value for display
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      
      // Log để debug
      console.log(`Airport input ${name}:`, value);
      return;
    }

    // Handle date validation - CẢI THIỆN XỬ LÝ DATE
    if (name === "departDate") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        // Reset return date if it's before the new depart date
        returnDate: prev.returnDate && prev.returnDate < value ? "" : prev.returnDate,
      }));
      return;
    }

    // Handle return date
    if (name === "returnDate") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      return;
    }

    // Handle passenger counts
    if (name === "adults" || name === "children") {
      const numValue = parseInt(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [name]: Math.max(0, Math.min(name === "adults" ? 9 : 8, numValue)),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // THÊM FUNCTION ĐỂ SWAP AIRPORTS
  const handleSwapAirports = () => {
    setFormData((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Convert tripType to API format
      const apiTripType: ApiTripType = tripType === "round-trip" ? "roundTrip" : "oneWay";

      // Extract airport codes using the service method
      const fromAirportCode = flightService.normalizeAirportCode(formData.from);
      const toAirportCode = flightService.normalizeAirportCode(formData.to);

      // Log để debug airport codes
      console.log('Raw from input:', formData.from);
      console.log('Raw to input:', formData.to);
      console.log('Extracted from code:', fromAirportCode);
      console.log('Extracted to code:', toAirportCode);

      // Validate extracted codes
      if (!fromAirportCode || fromAirportCode.length !== 3) {
        toast.error("Mã sân bay đi không hợp lệ. Vui lòng chọn lại.");
        return;
      }
      
      if (!toAirportCode || toAirportCode.length !== 3) {
        toast.error("Mã sân bay đến không hợp lệ. Vui lòng chọn lại.");
        return;
      }

      // Format the search parameters - CẢI THIỆN PARAMS
      const searchParams = {
        fromAirport: fromAirportCode,
        toAirport: toAirportCode,
        departureDate: formData.departDate,
        tripType: apiTripType,
        passengerCount: formData.adults + formData.children,
        adults: formData.adults,
        children: formData.children,
        ...(apiTripType === "roundTrip" && formData.returnDate && {
          returnDate: formData.returnDate
        })
      };

      // Log the search parameters for debugging
      console.log('Search Parameters:', searchParams);

      // Validate search parameters
      const validation = flightService.validateSearchParams(searchParams);
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        return;
      }

      // Additional client-side validation
      if (!fromAirportCode || !toAirportCode) {
        toast.error("Vui lòng chọn đầy đủ điểm đi và điểm đến");
        return;
      }

      if (fromAirportCode === toAirportCode) {
        toast.error("Điểm đi và điểm đến không thể giống nhau");
        return;
      }

      // Show loading toast
      const loadingToast = toast.info("Đang tìm kiếm chuyến bay...", {
        autoClose: false,
        closeButton: false
      });

      // Call the API
      const response = await flightService.searchFlights(searchParams);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      console.log('Search response:', response);

      // Check response structure
      if (response && (response.success !== false)) {
        // Store the search results - SỬA LẠI CÁCH LƯU DỮ LIỆU
        const searchResultsData = {
          searchParams,
          results: response,
          timestamp: new Date().toISOString()
        };
        
        // Use sessionStorage instead of localStorage for better performance
        sessionStorage.setItem('searchResults', JSON.stringify(searchResultsData));
        
        // Navigate to results page with search parameters
        const queryString = new URLSearchParams({
          from: fromAirportCode,
          to: toAirportCode,
          departDate: formData.departDate,
          ...(apiTripType === "roundTrip" && formData.returnDate && {
            returnDate: formData.returnDate
          }),
          tripType: apiTripType,
          adults: formData.adults.toString(),
          children: formData.children.toString(),
          passengers: (formData.adults + formData.children).toString()
        }).toString();

        router.push(`/flights?${queryString}`);
        // toast.success("Tìm thấy chuyến bay!");
      } else {
        toast.error(response?.message || "Không tìm thấy chuyến bay phù hợp!");
      }
    } catch (error: any) {
      console.error('Error searching flights:', error);
      
      let errorMessage = "Có lỗi xảy ra khi tìm kiếm chuyến bay!";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // THÊM VALIDATION CHO CLIENT-SIDE
  const isFormValid = () => {
    return (
      formData.from.trim() !== "" &&
      formData.to.trim() !== "" &&
      formData.departDate !== "" &&
      (tripType === "one-way" || formData.returnDate !== "") &&
      (formData.adults + formData.children) > 0
    );
  };

  return (
    <div id="searchForm" className={styles.flightSearchCard}>
      <form onSubmit={handleSubmit}>
        <div className={styles.tripTypeTop}>
          <button
            className={tripType === "round-trip" ? styles.active : ""}
            onClick={() => setTripType("round-trip")}
            type="button"
          >
            <GoArrowSwitch className={styles.icon} /> Khứ hồi
          </button>
          <button
            className={tripType === "one-way" ? styles.active : ""}
            onClick={() => setTripType("one-way")}
            type="button"
          >
            <GoArrowRight className={styles.icon} /> Một chiều
          </button>
        </div>

        
          <AirportInput
            label="Điểm đi"
            icon={FaPlaneDeparture}
            name="from"
            value={formData.from}
            onChange={handleInputChange}
            placeholder="Chọn sân bay đi..."
          />
          <AirportInput
            label="Điểm đến"
            icon={FaPlaneArrival}
            name="to"
            value={formData.to}
            onChange={handleInputChange}
            placeholder="Chọn sân bay đến..."
          />
        

        
          <div className={styles.dateInput}>
            <label htmlFor="departDate">
              <FaCalendarAlt className={styles.icon} /> Ngày đi
            </label>
            <input
              type="date"
              id="departDate"
              name="departDate"
              value={formData.departDate}
              onChange={handleInputChange}
              min={getTodayDate()}
              required
            />
          </div>

          {tripType === "round-trip" && (
            <div className={styles.dateInput}>
              <label htmlFor="returnDate">
                <FaCalendarAlt className={styles.icon} /> Ngày về
              </label>
              <input
                type="date"
                id="returnDate"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                min={formData.departDate || getTodayDate()}
                required={tripType === "round-trip"}
              />
            </div>
          )}
        

        <div className={styles.passengersDiv}>
          <label>
            <FiUsers className={styles.icon} /> Hành khách
          </label>
          <div className={styles.passengerInputs}>
            <div className={styles.passengerType}>
              <label htmlFor="adults">Người lớn (&gt;= 12 tuổi)</label>
              <input
                type="number"
                id="adults"
                name="adults"
                min="1"
                max="9"
                value={formData.adults}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.passengerType}>
              <label htmlFor="children">Trẻ em (2-11 tuổi)</label>
              <input
                type="number"
                id="children"
                name="children"
                min="0"
                max="8"
                value={formData.children}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <button type="submit" className={styles.searchBtn} disabled={isLoading || !isFormValid()}>
          {isLoading ? "Đang tìm kiếm..." : "Tìm chuyến bay"}
        </button>
      </form>
    </div>
  );
};

export default FlightSearch;