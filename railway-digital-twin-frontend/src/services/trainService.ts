import { TrainLocation } from "../types/Railway";

const API_URL = "http://localhost:8080/api";

export const trainService = {
  /**
   * Harita üzerindeki trenlerin anlık konumlarını çeker.
   */
  async getLiveTrainLocations(): Promise<TrainLocation[]> {
    try {
      const response = await fetch(`${API_URL}/trains/live-tracking`);
      if (!response.ok) throw new Error("Canlı konum verisi alınamadı");
      return await response.json();
    } catch (error) {
      console.error("Error fetching live tracking:", error);
      return [];
    }
  },


  /**
   * İhtiyaç duyulursa tek bir trenin detaylarını çeker.
   */
  async getTrainById(id: number) {
    const response = await fetch(`${API_URL}/trains/${id}`);
    return await response.json();
  }
};