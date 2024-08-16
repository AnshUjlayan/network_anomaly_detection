import React, { useEffect, useRef, useState } from "react";
import Dropzone from "dropzone";
import styles from "./FileUploader.module.css";
import { baseURL, uploadFile } from "../../api/api";

const FileUploader: React.FC = () => {
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const instructionRef = useRef<HTMLDivElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  useEffect(() => {
    const dropzone = new Dropzone(dropzoneRef.current!, {
      url: `${baseURL}/upload`,
      autoProcessQueue: false,
      maxFiles: 1,
      acceptedFiles: ".csv",
      previewTemplate: "<div></div>", 
      init: function () {
        this.on("addedfile", async (file: File) => {
          setUploadStatus("Uploading...");
          try {
            const response = await uploadFile(file);
            console.log("File uploaded successfully:", response);
            setUploadStatus("Upload successful");
          } catch (error) {
            console.error("Error uploading file:", error);
            setUploadStatus("Upload failed");
          }
        });
      },
    });

    if (instructionRef.current) {
      instructionRef.current.addEventListener("click", () => {
        dropzone.hiddenFileInput.click();
      });
    }

    return () => {
      dropzone.destroy();
    };
  }, []);

  return (
    <div className={styles.uploaderContainer}>
      <div ref={dropzoneRef} className={styles.dropzone}>
        <div ref={instructionRef} className={styles.instruction}>
          {uploadStatus || "Drag and drop a CSV file here, or click to upload"}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;