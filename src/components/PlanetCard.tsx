import { Card, CardContent, StyledComponentProps, SxProps, Typography } from "@mui/material"
import { Planet } from "../types"
import { formatRA, formatDec } from "../helpers/RaDecConversion"
const style = {
    width: "300px",
    background: "black",
    "&:hover": {
        cursor:"pointer",   
        borderColor:"white"
    }
} as SxProps
export const PlanetCard = ({ planet, onClick }: { planet: Planet, onClick:(planet:Planet) => void }) => {
    return (
        <Card variant="outlined" sx={style} onClick={()=>onClick(planet)}  >
            <CardContent>
                <Typography variant="h5" color="white">{planet.pl_name}</Typography>
                <Typography color="white"> RA: {formatRA(planet.ra)} </Typography>
                <Typography color="white"> DEC: {formatDec(planet.dec)} </Typography>
                <Typography color="white"> Distance From Earth: {planet.sy_dist}pc </Typography>
            </CardContent>
        </Card>
    )
}