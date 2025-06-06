export const appConfig = {
  port: process.env.PORT,
  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
  production: process.env.NODE_ENV === 'production',
};
