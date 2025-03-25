// Mock data for the application

export interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  occupancy: number;
  monthlyRevenue: number;
  type: 'apartment' | 'house' | 'condo' | 'commercial';
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  property: string;
  status: 'current' | 'late' | 'pending' | 'notice';
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
}

export interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed' | 'overdue';
  method: 'creditCard' | 'bankTransfer' | 'check' | 'cash';
  description: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  unit: string;
  tenantId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt: string | null;
}

// Properties data
export const properties: Property[] = [
  {
    id: 'prop1',
    name: 'Sunset Apartments',
    address: '123 Sunset Blvd, Los Angeles, CA 90001',
    units: 24,
    occupancy: 0.92,
    monthlyRevenue: 32400,
    type: 'apartment'
  },
  {
    id: 'prop2',
    name: 'River Heights',
    address: '456 River Rd, Chicago, IL 60601',
    units: 12,
    occupancy: 0.85,
    monthlyRevenue: 16200,
    type: 'condo'
  },
  {
    id: 'prop3',
    name: 'Mountain View Condos',
    address: '789 Mountain Dr, Denver, CO 80201',
    units: 36,
    occupancy: 0.78,
    monthlyRevenue: 42300,
    type: 'condo'
  },
  {
    id: 'prop4',
    name: 'Harbor Point',
    address: '321 Harbor St, Seattle, WA 98101',
    units: 18,
    occupancy: 0.95,
    monthlyRevenue: 27000,
    type: 'apartment'
  },
  {
    id: 'prop5',
    name: 'Green Valley Homes',
    address: '555 Valley Lane, Austin, TX 78701',
    units: 6,
    occupancy: 1.0,
    monthlyRevenue: 12000,
    type: 'house'
  }
];

// Tenants data
export const tenants: Tenant[] = [
  {
    id: 'ten1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '555-123-4567',
    unit: '101',
    property: 'prop1',
    status: 'current',
    leaseStart: '2023-01-01',
    leaseEnd: '2024-01-01',
    rentAmount: 1500
  },
  {
    id: 'ten2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '555-234-5678',
    unit: '204',
    property: 'prop1',
    status: 'late',
    leaseStart: '2022-08-15',
    leaseEnd: '2023-08-15',
    rentAmount: 1350
  },
  {
    id: 'ten3',
    name: 'Mike Williams',
    email: 'mike.w@example.com',
    phone: '555-345-6789',
    unit: '103',
    property: 'prop2',
    status: 'current',
    leaseStart: '2023-03-01',
    leaseEnd: '2024-03-01',
    rentAmount: 1450
  },
  {
    id: 'ten4',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    phone: '555-456-7890',
    unit: '305',
    property: 'prop3',
    status: 'notice',
    leaseStart: '2022-10-01',
    leaseEnd: '2023-10-01',
    rentAmount: 1200
  },
  {
    id: 'ten5',
    name: 'Robert Wilson',
    email: 'robert.w@example.com',
    phone: '555-567-8901',
    unit: '202',
    property: 'prop1',
    status: 'current',
    leaseStart: '2023-02-15',
    leaseEnd: '2024-02-15',
    rentAmount: 1400
  },
  {
    id: 'ten6',
    name: 'Lisa Brown',
    email: 'lisa.b@example.com',
    phone: '555-678-9012',
    unit: '104',
    property: 'prop2',
    status: 'current',
    leaseStart: '2023-01-15',
    leaseEnd: '2024-01-15',
    rentAmount: 1350
  },
  {
    id: 'ten7',
    name: 'Daniel Taylor',
    email: 'daniel.t@example.com',
    phone: '555-789-0123',
    unit: '301',
    property: 'prop3',
    status: 'pending',
    leaseStart: '2023-06-01',
    leaseEnd: '2024-06-01',
    rentAmount: 1250
  }
];

// Payments data
export const payments: Payment[] = [
  {
    id: 'pay1',
    tenantId: 'ten1',
    amount: 1500,
    date: '2023-06-01',
    status: 'paid',
    method: 'bankTransfer',
    description: 'June 2023 Rent'
  },
  {
    id: 'pay2',
    tenantId: 'ten2',
    amount: 1350,
    date: '2023-06-05',
    status: 'overdue',
    method: 'creditCard',
    description: 'June 2023 Rent (Late)'
  },
  {
    id: 'pay3',
    tenantId: 'ten3',
    amount: 1450,
    date: '2023-05-30',
    status: 'paid',
    method: 'bankTransfer',
    description: 'June 2023 Rent'
  },
  {
    id: 'pay4',
    tenantId: 'ten4',
    amount: 1200,
    date: '2023-06-01',
    status: 'paid',
    method: 'creditCard',
    description: 'June 2023 Rent'
  },
  {
    id: 'pay5',
    tenantId: 'ten5',
    amount: 1400,
    date: '2023-06-01',
    status: 'paid',
    method: 'check',
    description: 'June 2023 Rent'
  },
  {
    id: 'pay6',
    tenantId: 'ten6',
    amount: 1350,
    date: '2023-06-02',
    status: 'pending',
    method: 'bankTransfer',
    description: 'June 2023 Rent'
  },
  {
    id: 'pay7',
    tenantId: 'ten1',
    amount: 1500,
    date: '2023-05-01',
    status: 'paid',
    method: 'bankTransfer',
    description: 'May 2023 Rent'
  }
];

// Maintenance requests
export const maintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'maint1',
    propertyId: 'prop1',
    unit: '101',
    tenantId: 'ten1',
    title: 'Leaking faucet',
    description: 'The kitchen faucet is leaking and creating water damage.',
    priority: 'medium',
    status: 'completed',
    createdAt: '2023-05-15T10:30:00Z',
    completedAt: '2023-05-16T14:20:00Z'
  },
  {
    id: 'maint2',
    propertyId: 'prop1',
    unit: '204',
    tenantId: 'ten2',
    title: 'Broken heater',
    description: 'The heater is not working and it\'s getting cold.',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2023-06-01T08:45:00Z',
    completedAt: null
  },
  {
    id: 'maint3',
    propertyId: 'prop2',
    unit: '103',
    tenantId: 'ten3',
    title: 'Clogged drain',
    description: 'The bathroom sink drain is clogged.',
    priority: 'low',
    status: 'assigned',
    createdAt: '2023-06-02T15:20:00Z',
    completedAt: null
  },
  {
    id: 'maint4',
    propertyId: 'prop3',
    unit: '305',
    tenantId: 'ten4',
    title: 'Smoke detector beeping',
    description: 'The smoke detector is beeping and needs a new battery.',
    priority: 'low',
    status: 'new',
    createdAt: '2023-06-03T09:10:00Z',
    completedAt: null
  },
  {
    id: 'maint5',
    propertyId: 'prop1',
    unit: '202',
    tenantId: 'ten5',
    title: 'Window won\'t close',
    description: 'The bedroom window is stuck and won\'t close completely.',
    priority: 'medium',
    status: 'assigned',
    createdAt: '2023-05-28T13:15:00Z',
    completedAt: null
  }
];

// Helper functions to get data
export const getPropertyById = (id: string): Property | undefined => {
  return properties.find(p => p.id === id);
};

export const getTenantById = (id: string): Tenant | undefined => {
  return tenants.find(t => t.id === id);
};

export const getTenantsByProperty = (propertyId: string): Tenant[] => {
  return tenants.filter(t => t.property === propertyId);
};

export const getPaymentsByTenant = (tenantId: string): Payment[] => {
  return payments.filter(p => p.tenantId === tenantId);
};

export const getMaintenanceRequestsByProperty = (propertyId: string): MaintenanceRequest[] => {
  return maintenanceRequests.filter(m => m.propertyId === propertyId);
};

export const getMaintenanceRequestsByTenant = (tenantId: string): MaintenanceRequest[] => {
  return maintenanceRequests.filter(m => m.tenantId === tenantId);
}; 