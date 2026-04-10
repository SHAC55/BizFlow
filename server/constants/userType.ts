export const safeUserSelect = {
  id: true,
  name: true, // username
  mobile: true, // mobile number
  email: true,
  provider: true,
  verified: true,
  createdAt: true,
  updatedAt: true,

  business: {
    select: {
      id: true,
      name: true,
      gstNumber: true,
      address: true,
      createdAt: true,
    },
  },
} as const;
