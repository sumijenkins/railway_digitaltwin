import { Train } from "../types/Railway";

export const initialTrains: Train[] = [
  {
    id: "T-01",
    name: "Yük Treni 27",
    maxLoad: 1500,
    totalLoad: 1340,
    currentStationId: "izm-c",
    destinationStationId: "ban",
  },
  {
    id: "T-02",
    name: "Yük Treni 54",
    maxLoad: 1400,
    totalLoad: 970,
    currentStationId: "man",
    destinationStationId: "akh",
  },
];
