import dotenv from 'dotenv';

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  host: process.env.HOST,
  appUrl: process.env.APP_URL,

  databaseUrl: process.env.DATABASE_URL,

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  corsOrigin: process.env.CORS_ORIGIN,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,

  get isDev() {
    return this.nodeEnv === 'development';
  },
  get isProd() {
    return this.nodeEnv === 'production';
  },
};

export default env;
