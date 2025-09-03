import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchGyms } from "./codeforcesAPI.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GYMS_FILE = path.join(__dirname, "../model/gyms.json");
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

let gymsCache = new Map();

function arrayToMap(gymsArray) {
  const map = new Map();
  gymsArray.forEach((gym) => map.set(String(gym.id), gym));
  return map;
}

export function getMapCachedGyms() {
  return gymsCache;
}

function objectToMap(obj) {
  return new Map(Object.entries(obj));
}

function mapToObject(map) {
  return Object.fromEntries(map);
}

export function getGymById(gymId) {
  return gymsCache.get(String(gymId));
}

export function getGyms() {
  return mapToObject(gymsCache);
}

export async function refreshGymsNow() {
  try {
    if (fs.existsSync(GYMS_FILE)) {
      const raw = fs.readFileSync(GYMS_FILE, "utf-8").trim();

      if (raw) {
        try {
          const data = JSON.parse(raw);
          const isFresh = Date.now() - data.timestamp < CACHE_TTL;
          // assume it is always fresh
          gymsCache = objectToMap(data.gyms);
          return { timestamp: data.timestamp, gyms: data.gyms };
        } catch (parseErr) {
          console.warn(
            "Warning: gyms.json is corrupted, fetching fresh data..."
          );
        }
      }
    }

    // Fetch fresh gyms from API
    const gymsArray = await fetchGyms();
    gymsCache = arrayToMap(gymsArray);

    
    const gymsObj = mapToObject(gymsCache);
    const dataToSave = {
      timestamp: Date.now(),
      gyms: gymsObj,
      count: gymsCache.size,
    };
    fs.writeFileSync(GYMS_FILE, JSON.stringify(dataToSave, null, 2));

    console.log(`Gyms cache updated with ${gymsCache.size} gyms`);
    return dataToSave;
  } catch (err) {
    console.error("Failed to refresh gyms:", err);
    return { timestamp: Date.now(), gyms: {}, count: 0 };
  }
}
