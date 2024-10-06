import { Fragment, useEffect, useRef, useState } from "react"
import { Text, Line } from "@react-three/drei"
import { Constellation } from "../types"
import { Vector3 } from "three"
import { showConstillationLine, movePointToDistanceFromPoint } from "../helpers/MovingPoints"
import { ConstellationLine } from "./ConstellationLine"

export const ConstellationLines = ({cons, cameraPosition}:{cons:Constellation, cameraPosition:Vector3}) => {
    const textRef = useRef<any>(null)
    const [position, setPosition] = useState<Vector3>( new Vector3())

    useEffect(() => {
        const textPosition = movePointToDistanceFromPoint(cameraPosition, cons.lines[0].start, 10)
        textPosition.setX(textPosition.x)
        setPosition(textPosition)
    },[cameraPosition])

    useEffect(()=>{
        if(textRef.current) textRef.current.lookAt(cameraPosition) 
    },[position])

    useEffect(()=>{
        console.log("render")
    }, [])

    return (
        <Fragment >
        <Text position={position} ref={textRef} scale={0.25} anchorX={"left"}>&nbsp;&nbsp;{cons.name}</Text> 
        {
          cons.lines.map(((line,i) => <Line key={i.toString()+line.start.x.toString()+line.end.x.toString()} points={[line.start, line.end]}/>))
        }
      </Fragment>
    )
}