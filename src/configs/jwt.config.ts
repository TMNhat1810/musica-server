export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiration: {
    access: process.env.JWT_ACCESS_EXPIRATION_MINUTE,
    refresh: process.env.JWT_REFRESH_EXPIRATION_MINUTE,
  },
};
