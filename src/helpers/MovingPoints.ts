import { Vector3 } from "three";
import { ConstLine } from "../types";

export function movePointToDistance(pointArr: number[]) {
    const point = new Vector3(pointArr[0], pointArr[1], pointArr[2])
    const currentDistance = Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2);

    const scale = 10 / currentDistance;

    const newX = point.x * scale;
    const newY = point.y * scale;
    const newZ = point.z * scale;

    return new Vector3(newX, newY, newZ);
}

export function movePointToDistanceFromPoint(point1: Vector3, point2: Vector3, desiredDistance: number) {
    // Calculate the vector between the two points
    const direction = new Vector3().subVectors(point2, point1);

    // Step 2: Normalize the direction vector (make it unit length)
    direction.normalize();

    // Step 3: Scale the direction vector to the desired distance
    direction.multiplyScalar(desiredDistance);

    // Step 4: Add the scaled direction vector to point1 to get the new point
    return new Vector3().addVectors(point1, direction);

}

export function movePointByFactor(point1:Vector3, point2:Vector3, factor:number) {
    const direction = new Vector3().subVectors(point2, point1);
    direction.multiplyScalar(factor);
    return new Vector3().addVectors(point1, direction);
}

export function showConstillationLine(line: ConstLine, cameraPostion: Vector3) {
    console.log(line)
    const start = movePointToDistanceFromPoint(cameraPostion, line.start, 10)
    const end = movePointToDistanceFromPoint(cameraPostion, line.end, 10)
    console.log(cameraPostion, start, end)
    return {
        start:movePointToDistanceFromPoint(cameraPostion, line.start, 10),
        end: movePointToDistanceFromPoint(cameraPostion, line.end, 10)
    }
}