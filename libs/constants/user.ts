export const USER_ROLES = ['admin', 'user', 'doctor'] as const;
export type UserRole = (typeof USER_ROLES)[number];
