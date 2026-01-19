export const endpoints = {
  auth: {
    login: "/auth/login",
    registerCustomer: "/auth/register/customer",
    verifyOtp: "/auth/verify-otp",

    // Guest flows
    guestCreate: "/auth/guest",
    guestUpgrade: "/auth/guest/upgrade",

    // Email verification
    resendVerification: "/auth/resend-verification",

    // Password reset
    requestPasswordReset: "/auth/request-password-reset",
    verifyPasswordToken: "/auth/verify-password-token",
    resetPassword: "/auth/reset-password",

    // Social sign-in (mobile)
    googleSignin: "/auth/google/mobile-signin",
    appleSignin: "/auth/apple/mobile-signin"
  },

  user: {
    me: "/users/me",
    stats: "/users/me/stats"
  },

  orders: {
    create: "/orders",
    mine: "/orders/",
    stats: "/orders/me/stats",
    byId: (orderId: string) => `/orders/${orderId}`,

  },

  addresses: {
    create: "/addresses",
    list: "/addresses",
    autocomplete: "/addresses/places/autocomplete",
    details: "/addresses/places/details", // will use /:placeId

  },

  wallet: {
    get: "/wallet"
  },

  payments: {
    // For the current web flow we just call this and then redirect to tracking.
    stripeIntent: "/payments/stripe-intent",

    initialize: "/payments/initialize",
    verify: "/payments/verify",
    methods: "/payments/methods",
    methodById: (id: string) => `/payments/methods/${id}`,
    tokenizeInit: "/payments/tokenize-card/initialize"
  },

  chat: {
    initiate: "/chat/initiate",
    history: (chatId: string) => `/chat/${chatId}/history`,
    threads: "/chat/my-threads",
    updateThread: "/chat/update-thread",
    firebaseToken: "/chat/firebase-token"
  },

  promotions: {
    list: "/promotions",
    active: "/promotions/active",
    redeem: "/promotions/redeem"
  },

  config: { get: "/config" },
  reports: { create: "/reports" }
} as const;
