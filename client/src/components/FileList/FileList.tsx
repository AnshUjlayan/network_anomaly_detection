import React, { useState, useEffect } from "react";
import { getFileList } from "../../api/api";
import { useDashboardContext } from "../../context/DashboardContext";
import styles from "./FileList.module.css";

const FileList = () => {
  const [loading, setLoading] = useState(true);
  const { fileList, setFileList } = useDashboardContext();

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

  return (
    <ul className={styles.listContainer}>
      {loading ? (
        <p>Loading files...</p>
      ) : (
        fileList.map((file) => (
          <li onClick={() => console.log("clicked")} key={file}>
            {file}
          </li>
        ))
      )}
    </ul>
  );
};

export default FileList;
