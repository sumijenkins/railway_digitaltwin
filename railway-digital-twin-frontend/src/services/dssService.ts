const API_URL = "http://localhost:8080/api";

export const dssService = {
  async getOverview() {
    const response = await fetch(`${API_URL}/dss/overview`);

    if (!response.ok) {
      throw new Error("DSS overview could not be loaded");
    }

    return response.json();
  },

  async getRouteReport() {
    const response = await fetch(`${API_URL}/dss/route-report`);

    if (!response.ok) {
      throw new Error("DSS route report could not be loaded");
    }

    return response.json();
  },

  async getSegmentReport(segmentId: string) {
    const response = await fetch(`${API_URL}/dss/segment/${segmentId}`);

    if (!response.ok) {
      throw new Error("DSS segment report could not be loaded");
    }

    return response.json();
  },
};