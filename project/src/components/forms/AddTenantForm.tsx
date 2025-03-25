import React, { useState } from 'react';
import { properties } from '../../services/mockData';

interface TenantFormData {
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  unit: string;
  status: 'current' | 'late' | 'pending' | 'notice';
  leaseStart: string;
  leaseEnd: string;
  rentAmount: string;
}

interface AddTenantFormProps {
  onSubmit: (data: TenantFormData) => void;
  onCancel: () => void;
}

const AddTenantForm: React.FC<AddTenantFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    unit: '',
    status: 'pending',
    leaseStart: '',
    leaseEnd: '',
    rentAmount: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TenantFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name as keyof TenantFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TenantFormData, string>> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.propertyId) newErrors.propertyId = 'Property is required';
    if (!formData.unit.trim()) newErrors.unit = 'Unit is required';
    if (!formData.leaseStart) newErrors.leaseStart = 'Lease start date is required';
    if (!formData.leaseEnd) newErrors.leaseEnd = 'Lease end date is required';
    
    if (!formData.rentAmount.trim()) {
      newErrors.rentAmount = 'Rent amount is required';
    } else if (isNaN(parseFloat(formData.rentAmount))) {
      newErrors.rentAmount = 'Rent amount must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Add New Tenant</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
        
        <div>
          <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-1">
            Property *
          </label>
          <select
            id="propertyId"
            name="propertyId"
            value={formData.propertyId}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.propertyId ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select Property</option>
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
          {errors.propertyId && <p className="mt-1 text-sm text-red-600">{errors.propertyId}</p>}
        </div>
        
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
            Unit Number *
          </label>
          <input
            type="text"
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.unit ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="current">Current</option>
            <option value="late">Late</option>
            <option value="notice">Notice</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="leaseStart" className="block text-sm font-medium text-gray-700 mb-1">
            Lease Start Date *
          </label>
          <input
            type="date"
            id="leaseStart"
            name="leaseStart"
            value={formData.leaseStart}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.leaseStart ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.leaseStart && <p className="mt-1 text-sm text-red-600">{errors.leaseStart}</p>}
        </div>
        
        <div>
          <label htmlFor="leaseEnd" className="block text-sm font-medium text-gray-700 mb-1">
            Lease End Date *
          </label>
          <input
            type="date"
            id="leaseEnd"
            name="leaseEnd"
            value={formData.leaseEnd}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.leaseEnd ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.leaseEnd && <p className="mt-1 text-sm text-red-600">{errors.leaseEnd}</p>}
        </div>
        
        <div>
          <label htmlFor="rentAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Rent Amount *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="text"
              id="rentAmount"
              name="rentAmount"
              value={formData.rentAmount}
              onChange={handleChange}
              className={`w-full pl-7 p-2 border rounded-md ${errors.rentAmount ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="0.00"
            />
          </div>
          {errors.rentAmount && <p className="mt-1 text-sm text-red-600">{errors.rentAmount}</p>}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Tenant
        </button>
      </div>
    </form>
  );
};

export default AddTenantForm; 