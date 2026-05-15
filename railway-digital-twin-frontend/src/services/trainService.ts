import { TrainLocation } from "../types/Railway";

const API_URL = "http://localhost:8080/api";

export const trainService = {
  async getTrainLocations(): Promise<TrainLocation[]> {
    try {
      const response = await fetch(`${API_URL}/trains/locations?size=100`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.content ?? data;
    } catch (error) {
      console.error("Error fetching train locations:", error);
      return [];
    }
  }
};
