// API Endpoints Constants

export const API_ENDPOINTS = {
  // Account endpoints
  ACCOUNTS: {
    PROVIDER: {
      REGISTER: '/accounts/provider/register/',
      ME: '/accounts/provider/me/',
      ME_LOGO: '/accounts/provider/me/logo/',
      CHECK_STATUS: '/accounts/provider/check-status/',
    },
    STAFF: {
      LIST: '/accounts/staff/',
      DETAIL: (id: number) => `/accounts/staff/${id}/`,
      UPDATE_PERMISSIONS: (id: number) => `/accounts/staff/${id}/permissions/`,
      REGISTER: '/accounts/staff/register/',
    },
    AUTH: {
      COURIER_LOGIN: '/accounts/auth/login/courier/',
      ADMIN_LOGIN: '/accounts/auth/login/admin/',
      SEND_OTP: '/accounts/auth/send-otp/',
      VALIDATE_OTP: '/accounts/auth/validate-otp/',
      CHANGE_PASSWORD: '/accounts/auth/change-password/',
    },
  },

  // Admin endpoints
  ADMIN: {
    PROVIDERS: {
      LIST: '/accounts/provider/',
      DETAIL: (id: number) => `/accounts/provider/${id}/`,
      APPROVE: (id: number) => `/accounts/provider/${id}/approve/`,
    },
    RIDERS: {
      LIST: '/accounts/admin/riders/',
      DETAIL: (id: number) => `/accounts/admin/riders/${id}/`,
      APPROVE: (id: number) => `/accounts/admin/riders/${id}/approve/`,
    },
  },

  // Pricing endpoints
  PRICINGS: {
    WEIGHT_SLABS: {
      LIST: '/pricings/admin/weight-slabs/',
      DETAIL: (id: number) => `/pricings/admin/weight-slabs/${id}/`,
    },
    SERVICE_TYPES: {
      LIST: '/pricings/admin/service-types/',
      DETAIL: (id: number) => `/pricings/admin/service-types/${id}/`,
    },
    LOCATIONS: {
      LIST: '/pricings/admin/locations/',
      DETAIL: (id: number) => `/pricings/admin/locations/${id}/`,
      PUBLIC_LIST: '/pricings/locations/',
    },
  },

  // Orders endpoints
  ORDERS: {
    MANUAL: {
      CREATE: '/orders/manual/',
      LIST: '/orders/list/',
      DETAIL: (orderNumber: string) => `/orders/${orderNumber}/`,
    },
    REQUESTS: {
      NEARBY_LIST: '/orders/requests/nearby/',
      NEARBY_DETAIL: (requestNumber: string) => `/orders/requests/nearby/${requestNumber}/`,
      NEARBY_ACTION: (requestNumber: string) => `/orders/requests/nearby/${requestNumber}/action/`,
    },
    PAYMENT: (orderNumber: string) => `/orders/${orderNumber}/payment/`,
    STATS: '/orders/stats/',
    TRACKING: {
      PUBLIC: (orderNumber: string) => `/orders/track/${orderNumber}/`,
    },
    // Shipping Batches (Transport Buckets)
    SHIPPING: {
      CREATE: '/orders/buckets/',
      LIST: '/orders/buckets/list/',
      DETAIL: (batchNumber: string) => `/orders/buckets/${batchNumber}/`,
      ADD_ORDERS: (batchNumber: string) => `/orders/buckets/${batchNumber}/add-orders/`,
      UPDATE_LOCATION: (batchNumber: string) => `/orders/buckets/${batchNumber}/update-location/`,
      CLOSE: (batchNumber: string) => `/orders/buckets/${batchNumber}/close/`,
    },
  },

  // Invitations endpoints
  INVITATIONS: {
    VALIDATE: '/accounts/invitations/validate/',
    SEND: '/accounts/invitations/send/',
    LIST: '/accounts/invitations/',
    DETAIL: (id: number) => `/accounts/invitations/${id}/`,
    REVOKE: (id: number) => `/accounts/invitations/${id}/revoke/`,
  },

  // Courier Rider Management endpoints
  RIDERS: {
    LIST: '/riders/',
    DETAIL: (id: number) => `/riders/${id}/`,
    UPDATE_STATUS: (id: number) => `/riders/${id}/status/`,
    ASSIGNMENTS: {
      ACTIVE: '/riders/assignments/active/',
      ASSIGNABLE_ORDERS: '/riders/assignments/orders/assignable/',
      ASSIGN_ORDER: (orderNumber: string) =>
        `/riders/assignments/orders/${orderNumber}/`,
    },
  },

  // Analytics endpoints
  ANALYTICS: {
    OVERVIEW: '/dashboard/analytics/overview/',
    ORDERS: '/dashboard/analytics/orders/',
    REVENUE: '/dashboard/analytics/revenue/',
    SHIPMENTS: '/dashboard/analytics/shipments/',
  },
} as const;
