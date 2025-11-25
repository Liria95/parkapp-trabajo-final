import { API_URLS } from "../config/api.config";

export const getVehicles = async (token: string) => {
  try {
    const response = await fetch(`${API_URLS.VEHICLES}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getVehicles:", error);
    return { success: false, vehicles: [] };
  }
};
