declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      MONGODB_URI: string;
      JWT_SECRET: string;
      JWT_EXPIRE: string;
      JWT_COOKIE_EXPIRE: string;
      FRONTEND_URL: string;
      RATE_LIMIT_WINDOW_MS: string;
      RATE_LIMIT_MAX_REQUESTS: string;
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
      EMAIL_FROM: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_EMAIL: string;
      SMTP_PASSWORD: string;
      BCRYPT_SALT_ROUNDS: string;
      ADMIN_API_KEY: string;
    }
  }
}

export {};
