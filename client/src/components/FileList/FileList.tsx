import React, { useState, useEffect } from "react";
import {
  FaAngleUp,
  FaAngleDown,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa6";
import { BsThreeDots } from "react-icons/bs";
import {
  getFileList,
  getNetworkAnalysis,
  getDashboardData,
} from "../../api/api";
import { useDashboardContext } from "../../context/DashboardContext";
import styles from "./FileList.module.css";

const FileList = () => {
  const {
    fileList,
    setFileList,
    setTrafficConclusion,
    setPacketRates,
    setLatency,
    setDataTransfer,
  } = useDashboardContext();

  const [debouncedQuery, setDebouncedQuery] = useState(fileList.query);

  const fetchFiles = async () => {
    try {
      const fileListResponse = await getFileList(
        fileList.page,
        fileList.limit,
        debouncedQuery,
        fileList.sort,
        fileList.order,
      );
      setFileList((prev) => ({
        ...prev,
        total: fileListResponse.total,
        files: fileListResponse.files,
      }));
    } catch (error) {
      console.error("Error fetching files", error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setFileList((prev) => ({ ...prev, query: debouncedQuery }));
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedQuery]);

  useEffect(() => {
    fetchFiles();
  }, [
    fileList.page,
    fileList.sort,
    fileList.order,
    fileList.query,
    fileList.total,
  ]);

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

  const handleSortChange = (sort: string) => {
    const newOrder =
      fileList.sort === sort && fileList.order === "desc" ? "asc" : "desc";
    setFileList((prev) => ({ ...prev, sort, order: newOrder, page: 1 }));
  };

  return (
    <>
      <form
        className={styles.searchBar}
        onSubmit={(e) => {
          e.preventDefault();
          fetchFiles();
        }}
      >
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setDebouncedQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <div className={styles.listHeader}>
        <span
          className={styles.headerItem}
          onClick={() => handleSortChange("name")}
        >
          Name
          {fileList.sort === "name" && fileList.order === "asc" && (
            <FaAngleUp />
          )}
          {fileList.sort === "name" && fileList.order === "desc" && (
            <FaAngleDown />
          )}
        </span>
        <span
          className={styles.headerItem}
          onClick={() => handleSortChange("timestamp")}
        >
          Timestamp
          {fileList.sort === "timestamp" && fileList.order === "asc" && (
            <FaAngleUp />
          )}
          {fileList.sort === "timestamp" && fileList.order === "desc" && (
            <FaAngleDown />
          )}
        </span>
        <span
          className={styles.headerItem}
          onClick={() => handleSortChange("size")}
        >
          Size
          {fileList.sort === "size" && fileList.order === "asc" && (
            <FaAngleUp />
          )}
          {fileList.sort === "size" && fileList.order === "desc" && (
            <FaAngleDown />
          )}
        </span>
      </div>
      <div className={styles.listContainer}>
        {fileList.files.length === 0 ? (
          <div style={{ textAlign: "center" }}>No data to display</div>
        ) : (
          fileList.files.map((file) => (
            <div
              className={styles.listItem}
              onClick={() => handleFileClick(file.name)}
              key={file.name}
            >
              <span className={styles.fileItem}>{file.name}</span>
              <span className={styles.fileItem}>{file.timestamp}</span>
              <span className={styles.fileItem}>{file.size}</span>
            </div>
          ))
        )}
      </div>
      <div className={styles.pageNumber}>
        <span className={styles.pageNumberText}>
          Page {fileList.page} | {fileList.total ? fileList.total : "NaN"}
        </span>
        <div className={styles.pageButtons}>
          <button
            disabled={fileList.page === 1}
            onClick={() =>
              setFileList((prev) => ({ ...prev, page: fileList.page - 1 }))
            }
          >
            <FaAngleLeft />
          </button>
          {fileList.page > 3 && (
            <>
              <button
                onClick={() => setFileList((prev) => ({ ...prev, page: 1 }))}
              >
                1
              </button>
              <button disabled>
                <BsThreeDots />
              </button>
            </>
          )}
          {fileList.page - 2 > 0 && (
            <button
              onClick={() =>
                setFileList((prev) => ({ ...prev, page: fileList.page - 2 }))
              }
            >
              {fileList.page - 2}
            </button>
          )}
          {fileList.page - 1 > 0 && (
            <button
              onClick={() =>
                setFileList((prev) => ({ ...prev, page: fileList.page - 1 }))
              }
            >
              {fileList.page - 1}
            </button>
          )}
          <button className={styles.active}>{fileList.page}</button>
          {fileList.page + 1 <= fileList.total && (
            <button
              onClick={() =>
                setFileList((prev) => ({ ...prev, page: fileList.page + 1 }))
              }
            >
              {fileList.page + 1}
            </button>
          )}
          {fileList.page + 2 <= fileList.total && (
            <button
              onClick={() =>
                setFileList((prev) => ({ ...prev, page: fileList.page + 2 }))
              }
            >
              {fileList.page + 2}
            </button>
          )}
          {fileList.total - fileList.page > 3 && (
            <>
              <button disabled>
                <BsThreeDots />
              </button>
              <button
                onClick={() =>
                  setFileList((prev) => ({ ...prev, page: fileList.total }))
                }
              >
                {fileList.total}
              </button>
            </>
          )}
          <button
            disabled={fileList.page === fileList.total}
            onClick={() =>
              setFileList((prev) => ({ ...prev, page: fileList.page + 1 }))
            }
          >
            <FaAngleRight />
          </button>
        </div>
      </div>
    </>
  );
};

export default FileList;
