import { Camera, Vector3 } from "three";

// Helper function to format RA in HHh MMm SSs
export function formatRA(raDeg: number) {
  const raHoursTotal = raDeg / 15; // Convert RA from degrees to hours
  const raHours = Math.floor(raHoursTotal); // Get the hour part
  const raMinutesTotal = (raHoursTotal - raHours) * 60; // Get the fractional part for minutes
  const raMinutes = Math.floor(raMinutesTotal); // Get the minutes part
  const raSeconds = (raMinutesTotal - raMinutes) * 60; // Get the seconds part

  // Return formatted RA string in HHh MMm SSs
  return `${String(raHours).padStart(2, '0')}h ${String(raMinutes).padStart(2, '0')}m ${raSeconds.toFixed(2)}s`;
}

// Helper function to format Dec in ±DD° MM′ SS″
export function formatDec(decDeg: number) {
  const decSign = decDeg >= 0 ? "+" : "-"; // Determine the sign
  const decAbsolute = Math.abs(decDeg); // Get absolute value for calculations
  const decDegrees = Math.floor(decAbsolute); // Get the degree part
  const decMinutesTotal = (decAbsolute - decDegrees) * 60; // Get the fractional part for minutes
  const decMinutes = Math.floor(decMinutesTotal); // Get the minutes part
  const decSeconds = (decMinutesTotal - decMinutes) * 60; // Get the seconds part

  // Return formatted Dec string in ±DD° MM′ SS″
  return `${decSign}${String(decDegrees).padStart(2, '0')}° ${String(decMinutes).padStart(2, '0')}′ ${decSeconds.toFixed(2)}″`;
}

// Function to get RA and Dec as formatted strings from the camera's rotation
export function getRaDecFromCamera(camera: Camera) {
  // Step 1: Get the camera's world direction (a unit vector)
  const direction = new Vector3();
  camera.getWorldDirection(direction);  // This gives you {x, y, z} direction

  // Step 2: Calculate Declination (Dec) from the y component
  const dec = Math.asin(direction.y);   // Dec in radians

  // Step 3: Calculate Right Ascension (RA) from x and z components
  const ra = Math.atan2(direction.x, direction.z);  // RA in radians

  // Step 4: Convert RA and Dec from radians to degrees
  const raDeg = ra * (180 / Math.PI); // Convert RA to degrees
  const decDeg = dec * (180 / Math.PI); // Convert Dec to degrees

  // Step 5: Normalize RA to be in the range [0, 360)
  const raDegNormalized = (raDeg + 360) % 360;

  // Step 6: Format RA and Dec into standard notation
  const raString = formatRA(raDegNormalized); // Convert RA to HHh MMm SSs
  const decString = formatDec(decDeg); // Convert Dec to ±DD° MM′ SS″

  return {
    rightAscension: raString,
    declination: decString
  };
}

export function raDecDistToCartesian(ra:number, dec:number, dist:number) {
  const degreesToRads = (deg:number) => deg * (Math.PI/180)
  return new Vector3(    
    dist * Math.cos(degreesToRads(dec)) * Math.sin(degreesToRads(ra)),     
    dist * Math.sin(degreesToRads(dec)),    
    dist * Math.cos(degreesToRads(dec)) * Math.cos(degreesToRads(ra))
  )
}