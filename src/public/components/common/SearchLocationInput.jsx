import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Globe, Building, MapPin as LocationIcon, CheckCircle, Loader2 } from 'lucide-react';
import nepalLocationService from '../../../utils/nepalLocationService';

const SearchLocationInput = ({ onLocationSelected, placeholder = "Select your location..." }) => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false);

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    setIsLoadingProvinces(true);
    try {
      const provinceList = await nepalLocationService.getProvinces();
      setProvinces(provinceList);
    } catch (error) {
      console.error('Failed to load provinces:', error);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  const handleProvinceChange = async (provinceId) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict('');
    setSelectedMunicipality('');
    setDistricts([]);
    setMunicipalities([]);

    if (provinceId) {
      setIsLoadingDistricts(true);
      try {
        const districtList = await nepalLocationService.getDistrictsByProvince(provinceId);
        setDistricts(districtList);
      } catch (error) {
        console.error('Failed to load districts:', error);
      } finally {
        setIsLoadingDistricts(false);
      }
    }
  };

  const handleDistrictChange = async (districtId) => {
    setSelectedDistrict(districtId);
    setSelectedMunicipality('');
    setMunicipalities([]);

    if (districtId) {
      setIsLoadingMunicipalities(true);
      try {
        const municipalityList = await nepalLocationService.getMunicipalitiesByDistrict(districtId);
        setMunicipalities(municipalityList);
      } catch (error) {
        console.error('Failed to load municipalities:', error);
      } finally {
        setIsLoadingMunicipalities(false);
      }
    }
  };

  const handleMunicipalityChange = (municipalityId) => {
    setSelectedMunicipality(municipalityId);

    if (municipalityId && selectedProvince && selectedDistrict) {
      const province = provinces.find(p => p.id === selectedProvince);
      const district = districts.find(d => d.id === selectedDistrict);
      const municipality = municipalities.find(m => m.id === municipalityId);

      if (province && district && municipality) {
        const locationData = {
          province: province.name,
          district: district.name,
          municipality: municipality.name
        };
        onLocationSelected(locationData);
      }
    }
  };

  const SelectField = ({ 
    label, 
    icon: Icon, 
    value, 
    onChange, 
    options, 
    isLoading, 
    placeholder, 
    disabled = false,
    isCompleted = false
  }) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        <div className={`p-1.5 rounded-full mr-2 ${
          isCompleted 
            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
        {label}
        {isCompleted && <CheckCircle className="h-4 w-4 ml-2 text-green-600 dark:text-green-400" />}
      </label>
      
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className={`block w-full py-3 px-4 pr-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all duration-200 ${
            isCompleted
              ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-300'
              : disabled || isLoading
              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-red-300 dark:hover:border-red-600'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg mr-3">
            <MapPin className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Location Information
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please select your province, district, and municipality in order.
        </p>
      </div>

      <div className="space-y-6">
        {/* Province Selection */}
        <SelectField
          label="Province"
          icon={Globe}
          value={selectedProvince}
          onChange={handleProvinceChange}
          options={provinces}
          isLoading={isLoadingProvinces}
          placeholder="Select Province"
          isCompleted={!!selectedProvince}
        />

        {/* District Selection */}
        <SelectField
          label="District"
          icon={Building}
          value={selectedDistrict}
          onChange={handleDistrictChange}
          options={districts}
          isLoading={isLoadingDistricts}
          placeholder={selectedProvince ? "Select District" : "Select Province first"}
          disabled={!selectedProvince}
          isCompleted={!!selectedDistrict}
        />

        {/* Municipality Selection */}
        <SelectField
          label="Municipality"
          icon={LocationIcon}
          value={selectedMunicipality}
          onChange={handleMunicipalityChange}
          options={municipalities}
          isLoading={isLoadingMunicipalities}
          placeholder={selectedDistrict ? "Select Municipality" : "Select District first"}
          disabled={!selectedDistrict}
          isCompleted={!!selectedMunicipality}
        />
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Selection Progress</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full transition-colors ${
              selectedProvince ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${
              selectedDistrict ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${
              selectedMunicipality ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
          </div>
        </div>
        
        {selectedProvince && selectedDistrict && selectedMunicipality && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Location Selected Successfully
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {municipalities.find(m => m.id === selectedMunicipality)?.name}, {' '}
              {districts.find(d => d.id === selectedDistrict)?.name}, {' '}
              {provinces.find(p => p.id === selectedProvince)?.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchLocationInput;
