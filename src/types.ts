import { Vector3 } from "three"

export type Star = {
    x: number,
    y: number,
    z: number,
    name: string
}
  
export type Constellation = {
    lines: ConstLine[],
    name?: string
}

export type ConstLine = {
    start: Vector3
    end: Vector3
}

export type Planet = {
    pl_name:string,
    ra: number,
    dec: number,
    sy_dist: number
}