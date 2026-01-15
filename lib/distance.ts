/* ═══════════════════════════════════════════════════════════════════════════════
   DISTANCE UTILITIES - Haversine formula for geolocation distance
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Coordinates interface
 */
export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Calculate distance between two coordinates using Haversine formula
 *
 * @param from - Starting coordinates
 * @param to - Ending coordinates
 * @returns Distance in kilometers
 *
 * @example
 * ```ts
 * const dubai = { latitude: 25.2048, longitude: 55.2708 }
 * const abudhabi = { latitude: 24.4539, longitude: 54.3773 }
 * const distance = calculateDistance(dubai, abudhabi) // ~132 km
 * ```
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const earthRadiusKm = 6371
  const dLat = toRadians(to.latitude - from.latitude)
  const dLon = toRadians(to.longitude - from.longitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Format distance for display
 *
 * @param distanceKm - Distance in kilometers
 * @returns Formatted distance string
 *
 * @example
 * ```ts
 * formatDistance(0.5)  // "500m"
 * formatDistance(1.2)  // "1.2km"
 * formatDistance(15)   // "15km"
 * ```
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000)
    return `${meters}m`
  }
  return `${distanceKm.toFixed(1)}km`
}

/**
 * Get user's current location
 *
 * @returns Promise resolving to coordinates or rejecting with error
 *
 * @example
 * ```ts
 * try {
 *   const location = await getCurrentLocation()
 *   console.log(location.latitude, location.longitude)
 * } catch (error) {
 *   console.error('Location access denied')
 * }
 * ```
 */
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}
