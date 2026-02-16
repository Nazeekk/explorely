const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'RABBITMQ_URL'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`ERROR: missing environment variable ${key}`);
    process.exit(1);
  }
});

export const config = {
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  rabbitmq: {
    url: String(process.env.RABBITMQ_URL),
  },
};
