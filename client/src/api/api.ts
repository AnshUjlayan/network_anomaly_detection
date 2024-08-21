import axios from "axios";

export const baseURL = "http://localhost:8000";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getFileList = async (
  page: number,
  limit: number,
  query: string,
  sort: string = "timestamp",
  order: string = "asc",
) => {
  const response = await api.get("/filelist", {
    params: {
      page,
      limit,
      query,
      sort,
      order,
    },
  });
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

export const getInterfaceList = async () => {
  try {
    const response = await api.get("/interfaces");

    if (Array.isArray(response.data)) {
      return response.data;
    } else if (typeof response.data === "object") {
      const arrayData = Object.values(response.data).find(Array.isArray);
      if (arrayData) return arrayData;
    }

    console.warn("Unexpected data structure from API, returning empty array");
    return [];
  } catch (error) {
    console.error("Error fetching interface list:", error);
    throw error;
  }
};

export const uploadFile = async (file: File, rename : string , overwrite : boolean) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("file", file);
  formData.append("rename", rename);
  formData.append("overwrite", overwrite.toString());
  try {
    const response = await api.post("/upload", 
      formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const generateCsv = async (device: string, duration: number) => {
  try {
    const response = await api.post("/tcpdump", {
      device,
      duration,
      output_file: `tcpdump_${Date.now()}`,
      overwrite: false,
    });

    return response.data.task_id;
  } catch (error) {
    console.error("Error generating CSV:", error);
    throw error;
  }
};

export const getTaskStatus = async (taskId: string) => {
  try {
    const response = await api.get(`/task/${taskId}`);
    if(response.data.status === "SUCCESS"){ 
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error fetching task status:", error);
    throw error;
  }
}