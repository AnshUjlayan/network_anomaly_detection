import React, { useState, useEffect } from "react";
import {
  getFileList,
  getNetworkAnalysis,
  getDashboardData,
} from "../../api/api";
import { useDashboardContext } from "../../context/DashboardContext";
import styles from "./FileList.module.css";

const FileList = () => {
  const [loading, setLoading] = useState(true);
  const {
    fileList,
    setFileList,
    setTrafficConclusion,
    setPacketRates,
    setLatency,
    setDataTransfer,
  } = useDashboardContext();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const files = await getFileList();
        setFileList(files);
      } catch (error) {
        console.error("Error fetching files", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleFileClick = async (fileName: string) => {
    try {
      const trafficConclusion = await getNetworkAnalysis(fileName);
      const dashboardData = await getDashboardData(fileName);
      setTrafficConclusion(trafficConclusion);
      setPacketRates(dashboardData.packetRates);
      setLatency(dashboardData.latency);
      setDataTransfer(dashboardData.dataTransfer);
    } catch (error) {
      console.error("Error fetching analysis", error);
    }
  };

  return (
    <ul className={styles.listContainer}>
      {loading ? (
        <p>Loading files...</p>
      ) : (
        fileList.map((file) => (
          <li onClick={() => handleFileClick(file)} key={file}>
            {file}
          </li>
        ))
      )}
    </ul>
  );
};

export default FileList;
