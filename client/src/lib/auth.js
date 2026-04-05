export const hasCompletedOnboarding = (user) =>
  Boolean(user?.name && user?.mobile && user?.business);
