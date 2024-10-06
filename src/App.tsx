import React, { FormEventHandler, Fragment, MouseEventHandler, RefAttributes, useEffect, useRef, useState, WheelEventHandler } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import './App.css';
import { Vector3 } from 'three';
import { FakeGlowMaterial } from './glowMaterial';
import { Center, Hud, Line, PerspectiveCamera, PointerLockControls, Text, Wireframe } from '@react-three/drei';
import { getRaDecFromCamera, raDecDistToCartesian } from './helpers/RaDecConversion';
import { Box, Button, Card, CircularProgress, Drawer, FormControl, Input, InputLabel, Modal, OutlinedInput, Stack, TextField, Typography } from '@mui/material';
import { ConstellationLines } from './components/constellation';
import { Constellation, ConstLine, Planet, Star } from './types';
import { movePointByFactor, movePointToDistanceFromPoint, showConstillationLine } from './helpers/MovingPoints';
import { ConstellationLine } from './components/ConstellationLine';
import { PlanetCard } from './components/PlanetCard';

const ORIGIN = new Vector3(0, 0, 0)
const NORMILIZATION_FACTOR = 0.5
const CONST_OVERLAY_DIST = 10
const API = "https://space-apps-andromeda.onrender.com"


//Rather avoid the informParent function but don't want to use redux in this code that I'm writing in a weekend
function MyStuff({ currentPlanet, cameraPosition, clearConstMaking, informParent, constellation, saveCons, stars }: { currentPlanet:string, saveCons: boolean, constellation: string, cameraPosition: Vector3, clearConstMaking: boolean, informParent: (e: boolean) => void, stars: Star[] }) {
  const camera = useThree(state => state.camera)
  const [isLocked, setIsLocked] = useState(false)
  const [creatingCon, setCreatingCon] = useState(false)
  const [creatingLine, setCreatingLine] = useState(false)
  const [lineStart, setLineStart] = useState<Vector3>()
  const [constellations, setConstellations] = useState<Constellation[]>([])
  const [inProgCons, setInProgCons] = useState<ConstLine[]>([])
  const [hoveredStar, setHoveredStar] = useState<{ name: string } | undefined>(undefined)
  const [ra, setRa] = useState("")
  const [dec, setDec] = useState("")
  const ref = useRef<any>(null)
  const controlRef = useRef<any>(null)

  useEffect(() => {
    const unlockOnEnterPress = (e: any) => {
      if (controlRef.current && controlRef.current.isLocked && e.key === "Enter") 
        controlRef.current.unlock()        
    }
    document.addEventListener("keydown", unlockOnEnterPress)
    return ()=> {document.removeEventListener("keydown", unlockOnEnterPress)}
  }, [])

  useEffect(() => {
    if (saveCons && inProgCons.length > 0 && !constellations.some(con => con.name === constellation)) {
      setConstellations(current => [...current, { lines: inProgCons, name: constellation }])
      setInProgCons([])
      setCreatingCon(false)
    }
  }, [saveCons])

  useFrame(() => {
    const res = getRaDecFromCamera(camera)
    setRa(res.rightAscension)
    setDec(res.declination)
    if (lineStart) {
      ref.current.rotation.x += 0.01
      ref.current.rotation.y += 0.01
    }

  })

  useEffect(() => {
    informParent(creatingCon)
  }, [creatingCon])

  useEffect(() => {
    if (!clearConstMaking) return
    setCreatingLine(false)
    setLineStart(undefined)
  }, [clearConstMaking])

  useEffect(() => {
    if(controlRef.current.isLocked) return
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
    camera.lookAt(cameraPosition.x, cameraPosition.y, cameraPosition.z + 1)    
  }, [cameraPosition])

  const starHovered = (name: string) => {
    if (!isLocked) return
    setHoveredStar({ name: name })
  }

  const starUnhovered = () => {
    setHoveredStar(undefined)
  }

  const handleStarClick = (e: ThreeEvent<MouseEvent>) => {
    if (!creatingCon) setCreatingCon(true)
    if (!creatingLine) {
      setLineStart(movePointToDistanceFromPoint(cameraPosition, e.object.position, CONST_OVERLAY_DIST))
      setCreatingLine(true)
    }
    else {
      setCreatingLine(false)
      setInProgCons(current => lineStart ? [...current, { start: lineStart, end: movePointToDistanceFromPoint(cameraPosition, e.object.position, CONST_OVERLAY_DIST) }] : current)
      setLineStart(undefined)
    }
  }

  return (
    <>
      {stars.map(star => (
        <mesh key={`${star.x}-${star.y} = ${star.z}`} position={movePointByFactor(ORIGIN, new Vector3(star.x, star.y, star.z), NORMILIZATION_FACTOR)} scale={0.055} onPointerEnter={e => starHovered(star.name)} onPointerLeave={starUnhovered} onClick={handleStarClick}>
          <sphereGeometry />
          <FakeGlowMaterial glowColor={"white"} glowSharpness={.2} />
        </mesh>
      ))}

      {lineStart &&
        <mesh position={lineStart} ref={ref} scale={0.055}>
          <icosahedronGeometry />
          <meshBasicMaterial attach="material" color="grey" />
        </mesh>
      }

      {constellations?.map((cons) =>
        <ConstellationLines key={cons.name} cons={cons} cameraPosition={cameraPosition} />
      )
      }
      {
        inProgCons?.map((line, i) => <Line key={i.toString()+line.start.x.toString()+line.end.x.toString()} points={[line.start, line.end]}/>)
      }


      {/* <mesh position={[0,0,0]}>
      <sphereGeometry/>
      <meshBasicMaterial color={"white"}  opacity={0.1}/>
      <Wireframe/>
    </mesh> */}

      <PointerLockControls camera={camera} onLock={() => setIsLocked(true)} onUnlock={() => setIsLocked(false)} ref={controlRef} />
      <Hud>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        {hoveredStar &&
          <>
            <Line points={[0, 0, 0, .5, .5, 0]} />
            <Text position={[.5, .5, 0]} anchorX={"left"} anchorY={"bottom"} scale={0.1}>{hoveredStar.name}</Text>
            <Line points={[.5, .5, 0, .5 + (0.055 * hoveredStar.name.length), .5, 0]} />
          </>
        }
        <mesh position={[-8.5, 4, 0]}>
          <Text fontSize={.5} anchorX={"left"}> {currentPlanet} </Text>
        </mesh>
        <mesh position={[5, -3, 0]}>
          <Text fontSize={.25} anchorX={"left"}> RA: {ra} </Text>
        </mesh>
        <mesh position={[5, -3.5, 0]}>
          <Text fontSize={.25} anchorX={"left"}> DEC: {dec} </Text>
        </mesh>
        <mesh position={[0, 0, 0]} scale={0.01}>
          <circleGeometry />
          <meshBasicMaterial color={"blue"} />
        </mesh>
      </Hud>
    </>
  )
}



function App() {
  const [cameraPosition, setCameraPosition] = useState(ORIGIN)
  const [starMap, setStarMap] = useState<Star[]>([])
  const [clear, setClear] = useState<boolean>(false)
  const [showModal, setShowModal] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [userInCreationMode, setUserInCreationMode] = useState(false)
  const [consName, setConsName] = useState("")
  const [saveCons, setSaveCons] = useState(false)
  const [planets, setPlanets] = useState<Planet[]>([])
  const [currentPlanet, setCurrentPlanet] = useState<string>("Earth")



  useEffect(() => {
    fetch(`${API}/earthStars`).then(res=>res.json()).then(data=>{
      setStarMap(data)
    })

    fetch(`${API}/planets`).then(res=>res.json()).then(data=>{
      setPlanets(data)
    })
  }, [])

  const handleCanvasEnter = (e: any) => {
    if (e.key != "Enter" || !userInCreationMode || showModal) return
    setShowModal(true)
  }

  useEffect(() => {
    document.addEventListener("keydown", handleCanvasEnter)
    return () => { document.removeEventListener("keydown", handleCanvasEnter) }
  }, [userInCreationMode, showModal])

  const handleCanvasClick: MouseEventHandler = (e) => {
    if (e.button === 2) setClear(true)
  }
  const handleAfterCanvasClick: MouseEventHandler = (e) => {
    if (e.button === 2) setClear(false)
  }

  const handleTravelClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setIsDrawerOpen(true)
  }

  const handleConstellationName: FormEventHandler = (e) => {
    e.preventDefault()
    setSaveCons(true)
    setShowModal(false)
  }

  const handlePlanetCardClick = (planet:Planet) => {
    setIsDrawerOpen(false)
    setStarMap([])
    setCurrentPlanet(planet.pl_name)
    fetch(`${API}/starsNear?ra=${planet.ra}&dec=${planet.dec}&dist=${planet.sy_dist}`).then(res=>res.json()).then(data=>{
      setStarMap(data)
      // setCameraPosition(raDecDistToCartesian(ra, dec, dist))
      setCameraPosition(movePointByFactor(ORIGIN, raDecDistToCartesian(planet.ra, planet.dec,planet.sy_dist), NORMILIZATION_FACTOR))
    })
  }

  useEffect(()=>{
    if(saveCons) {
      setTimeout(()=>{
        setConsName("")
        setSaveCons(false)
      },1000)
    }
  },[saveCons])

  return (
    <div className="App">
      {
        starMap.length <= 0 ?
          <Box style={{ background: "black", height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress size={100}/>
          </Box>
          :
          <>
            <div className="ui">
              <Button size='large' style={{ zIndex: 10 }} onClick={handleTravelClick}>Travel</Button>
            </div>
            <Canvas onMouseDown={handleCanvasClick} onMouseUp={handleAfterCanvasClick} >
              <ambientLight intensity={1} />
              <MyStuff currentPlanet={currentPlanet} cameraPosition={cameraPosition} stars={starMap} clearConstMaking={clear} informParent={setUserInCreationMode} constellation={consName} saveCons={saveCons} />
            </Canvas>
          </>
      }
      <Drawer
        anchor={"bottom"}
        open={isDrawerOpen}
        onClose={()=>setIsDrawerOpen(false)}
        onClick={e=>e.stopPropagation()}
        PaperProps={{style:{backgroundColor:"transparent"}}}
      >
        <Stack direction="row" gap={3} p={5}
        style={{backgroundColor: "rgba(18,18,18,0.5)", overflowY:"hidden", overflowX:"scroll"}} width={"fit-content"}>
          {planets.map((planet,i) => <PlanetCard planet={planet} key={i} onClick={handlePlanetCardClick}/>)}
        </Stack>
      </Drawer>
      <Modal style={{ zIndex: 10 }} open={showModal}>
        {/* <Box style={{position:"absolute", top:"50%", left:"50%", width:"30%", transform: 'translate(-50%, -50%)', backgroundColor:"white"}} onClick={e=>e.stopPropagation()}> */}
        <Stack gap={4} component={"form"} onClick={e => e.stopPropagation()} sx={{ position: "absolute", top: "50%", left: "50%", width: "30%", transform: 'translate(-50%, -50%)', color: "white", background: "black", border:"1px solid white", p:5 }} onSubmit={handleConstellationName}>
          <Typography variant='h5'>Name Your Constellation</Typography>
          <OutlinedInput value={consName} onChange={e => setConsName(e.target.value)} style={{ color: "white", border:"1px white solid" }} />
          <Button sx={{color:"white", border:"1px white solid", background:"transparent", width:"fit-content" }} type='submit' variant="contained" size="large">Name It!</Button>
        </Stack>
        {/* </Box> */}
      </Modal>
    </div>
  );
}

export default App;
