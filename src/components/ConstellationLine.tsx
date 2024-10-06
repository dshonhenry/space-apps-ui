import { useMemo } from "react"
import { ConstLine } from "../types"
import { showConstillationLine } from "../helpers/MovingPoints"
import { Vector3 } from "three"
import { Line } from "@react-three/drei"

export const ConstellationLine = ({line, cameraPosition}:{line:ConstLine, cameraPosition:Vector3}) => {
    const points = useMemo(()=>{
        const p = showConstillationLine(line, cameraPosition)
        console.log(p)
        return p
    },[line, cameraPosition])
    return <Line points={[line.start, line.end]} scale={2} />
}