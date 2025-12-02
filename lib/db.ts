import { Pool } from 'pg';

let pool: Pool | null = null;

/**
 * Get or create the database connection pool.
 * Uses lazy initialization to prevent module-level errors when DATABASE_URL is missing.
 * @throws Error if DATABASE_URL is not defined
 */
export function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not defined. Create a .env.local file with your Neon connection string. Run "node scripts/setup-env.js" for help.',
    );
  }

  const useSSL = process.env.DATABASE_SSL_DISABLED !== 'true';

  // Create a connection pool for better performance
  pool = new Pool({
    connectionString,
    ssl: useSSL
      ? {
          rejectUnauthorized: false,
        }
      : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  return pool;
}

// Export default for backward compatibility
// Note: Importing this will still cause errors if DATABASE_URL is missing
// Use getPool() function instead for better error handling
export default getPool;

