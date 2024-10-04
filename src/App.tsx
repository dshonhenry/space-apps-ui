import React, { MouseEventHandler, useEffect, useState, WheelEventHandler } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import './App.css';
import { Camera, CircleGeometry, MeshBasicMaterial, Vector3 } from 'three';
import { FakeGlowMaterial } from './glowMaterial';
import { DragControls, Hud, Line, MapControls, OrbitControls, PerspectiveCamera, Plane, PointerLockControls, Text, TrackballControls, Wireframe } from '@react-three/drei';

const degreesToRads = (d:number) => d * (Math.PI/180)
const ROTATION_ADJUST = 100

// function eulerToRaDec(camera:Camera) {
//   const yaw = camera.rotation.y;  
//   const pitch = camera.rotation.x;

//   const xDir = Math.cos(pitch) * Math.cos(yaw);
//   const yDir = Math.sin(pitch);
//   const zDir = Math.cos(pitch) * Math.sin(yaw);

 
//   const dec = Math.asin(yDir); 

//   const ra = Math.atan2(zDir, xDir);

//   const raDeg = ra * (180 / Math.PI);
//   const decDeg = dec * (180 / Math.PI);

//   const raHoursTotal = raDeg / 15; // 15 degrees per hour
//   const raHours = Math.floor(raHoursTotal); // Get the hour part
//   const raMinutesTotal = (raHoursTotal - raHours) * 60;
//   const raMinutes = Math.floor(raMinutesTotal); // Get the minutes part
//   const raSeconds = (raMinutesTotal - raMinutes) * 60; // Get the seconds part

//   // Handle Dec, keeping track of the sign for north (+) or south (-)
//   const decSign = decDeg >= 0 ? "+" : "-";
//   const decAbsolute = Math.abs(decDeg);
//   const decDegrees = Math.floor(decAbsolute);
//   const decMinutesTotal = (decAbsolute - decDegrees) * 60;
//   const decMinutes = Math.floor(decMinutesTotal);
//   const decSeconds = (decMinutesTotal - decMinutes) * 60;

//   // Format Right Ascension as "HHh MMm SSs"
//   const raString = `${String(raHours).padStart(2, '0')}h ${String(raMinutes).padStart(2, '0')}m ${raSeconds.toFixed(2)}s`;

//   // Format Declination as "+DD° MM′ SS″" or "-DD° MM′ SS″"
//   const decString = `${decSign}${String(decDegrees).padStart(2, '0')}° ${String(decMinutes).padStart(2, '0')}′ ${decSeconds.toFixed(2)}″`;

//   return {
//     raString:raDeg.toString(),
//     decString
//   };
// }

// Helper function to format RA in HHh MMm SSs
function formatRA(raDeg:number) {
  const raHoursTotal = raDeg / 15; // Convert RA from degrees to hours
  const raHours = Math.floor(raHoursTotal); // Get the hour part
  const raMinutesTotal = (raHoursTotal - raHours) * 60; // Get the fractional part for minutes
  const raMinutes = Math.floor(raMinutesTotal); // Get the minutes part
  const raSeconds = (raMinutesTotal - raMinutes) * 60; // Get the seconds part

  // Return formatted RA string in HHh MMm SSs
  return `${String(raHours).padStart(2, '0')}h ${String(raMinutes).padStart(2, '0')}m ${raSeconds.toFixed(2)}s`;
}

// Helper function to format Dec in ±DD° MM′ SS″
function formatDec(decDeg:number) {
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
function getRaDecFromCamera(camera:Camera) {
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

function MyStuff({cameraPosition,  stars}:{cameraPosition:Vector3, stars:Star[]}) {
  const camera = useThree(state=>state.camera)
  const [isLocked, setIsLocked] = useState(false)
  const [hoveredStar, setHoveredStar] = useState<{name:string}|undefined>(undefined)
  const [ra, setRa] = useState("")
  const [dec, setDec] = useState("")
  useFrame(()=>{
    const res = getRaDecFromCamera(camera)
    setRa(res.rightAscension)
    setDec(res.declination)
    
  })

  useEffect(()=>{
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
    camera.lookAt(cameraPosition.x, cameraPosition.y, cameraPosition.z+1)
  },[cameraPosition])

  const starHovered = (name:string) => {
    if(!isLocked) return
    setHoveredStar({name:name})
  }

  const starUnhovered = () => {
    setHoveredStar(undefined)
  }
 

  return (
    <>
    {/* <mesh position={ new Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z + 50)} scale={0.2} onClick={console.log}>
        <sphereGeometry/>
        <FakeGlowMaterial glowColor={"white"} glowSharpness={.2}/>
      </mesh> */}
    {stars.map(star => (
      <mesh key={`${star.x}-${star.y} = ${star.z}`} position={ new Vector3(star.x, star.y, star.z)} scale={0.05} onPointerEnter={e=>starHovered(star.name)} onPointerLeave={starUnhovered}>
        <sphereGeometry/>
        <FakeGlowMaterial glowColor={"white"} glowSharpness={.2}/>
      </mesh>
    ))}
    <mesh position={[0,0,0]}>
      <sphereGeometry/>
      <meshBasicMaterial color={"white"}  opacity={0.1}/>
      <Wireframe/>
    </mesh>
    <PointerLockControls camera={camera} onLock={()=>setIsLocked(true)} onUnlock={()=>setIsLocked(false)}/>
    <Hud>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      {hoveredStar && 
      <>
        <Line points={[0,0,0,.5,.5,0]}/>
        <Text position={[.5, .5, 0]} anchorX={"left"} anchorY={"bottom"} scale={0.1}>{hoveredStar.name}</Text>
        <Line points={[.5,.5,0,.5+(0.055*hoveredStar.name.length),.5,0]}/>
      </>
      }
      <mesh position={[5, -3, 0]}>
        <Text fontSize={.25} anchorX={"left"}> RA: {ra} </Text>
      </mesh>
      <mesh position={[5, -3.5, 0]}>
        <Text fontSize={.25} anchorX={"left"}> DEC: {dec} </Text>
      </mesh>
      <mesh position={[0,0,0]} scale={0.01}>
        <circleGeometry/>
        <meshBasicMaterial color={"blue"}/>
      </mesh>
    </Hud>
    </>
  )
}

type Star = {
  x:number,
  y:number,
  z:number,
  name:string
}

function App() {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(0,0,0))
  const [starMap, setStarMap] = useState<Star[]>([])

  useEffect(()=>{
    const ra = 294.635917
    const dec = 46.0664076
    const dist = 396.3320
    fetch(`http://localhost:8000/hostStars`).then(res=>res.json()).then(data=>{
      setStarMap(data)
      // for(const star of data){
      //   if(!star.distance_gspphot) continue
      //   const z = ((star.distance_gspphot) * Math.cos(degreesToRads(star.dec)) * Math.cos(degreesToRads(star.ra)))
      //   const x = ((star.distance_gspphot) * Math.cos(degreesToRads(star.dec)) * Math.sin(degreesToRads(star.ra)))
      //   const y = ((star.distance_gspphot) * Math.sin(degreesToRads(star.dec)))
      //   starMap.push([x,y,z])
      // }
      // setPoints(starMap)
      // const camX = (dist * Math.cos(degreesToRads(dec)) * Math.sin(degreesToRads(ra)))
      // const camY = (dist * Math.sin(degreesToRads(dec)))
      // const camZ = (dist * Math.cos(degreesToRads(dec)) * Math.cos(degreesToRads(ra)) )
      // setCameraPosition(new Vector3(camX, camY , camZ ))
      setCameraPosition(new Vector3(10,10,10))
    })
  },[])

   return (
    <div className="App">
      {
        starMap.length <= 0 ?
        <></> 
        :
        <>
          <div className="ui">
            <button>Travel</button>
          </div>
          <Canvas >    
            <ambientLight intensity={1} />          
            <MyStuff cameraPosition={cameraPosition} stars={starMap} />        
          </Canvas>
        </>
      }
    </div>
  );
}

export default App;
