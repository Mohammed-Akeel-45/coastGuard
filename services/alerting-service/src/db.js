import { Pool } from "pg";
import { config } from "./config.js";

export const pool = new Pool({
  connectionString: config.pg.connectionString,
});

const client = await pool.connect();

/**
 * findOfficialsNearby: returns array of {user_id, user_name, email, phone_number, distance_m}
 */
export async function findOfficialsNearby(lat, lon, radiusKm) {
  const radiusMeters = radiusKm * 1000;
  const sql = `
    SELECT u.user_id, u.user_name, u.email, u.phone,
           ST_Distance(u.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_m
    FROM users u
    JOIN user_roles ur ON u.user_role_id = ur.role_id
    WHERE ur.role_name = 'official'
      AND u.location IS NOT NULL
      AND ST_DWithin(u.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
    ORDER BY distance_m ASC;
  `;
  const vals = [lon, lat, radiusMeters]; // ST_MakePoint(long, lat)
  const { rows } = await client.query(sql, vals);
  return rows;
}
