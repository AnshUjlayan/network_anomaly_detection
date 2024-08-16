import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getFileList = async () => {
  const response = await api.get("/dumps");
  return response.data;
};

export const getNetworkAnalysis = async (fileName: string) => {
  const response = await api.post("/analysis/conclusion", {
    file: fileName,
  });
  return response.data;
};

export const getDashboardData = async (fileName: string) => {
  const response = await api.post("/analysis", {
    file: fileName,
  });
  return response.data;
};
