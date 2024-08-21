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
      acceptedFiles: ".csv,.pcap",
      previewTemplate: "<div></div>", 
      init: function () {
        this.on("addedfile", async (file: File) => {
          setUploadStatus("Uploading...");
          let newFileName = file.name;
          let overwrite = false;

          try {
            // Attempt to upload file
            await uploadFile(file, newFileName, overwrite);
            setUploadStatus("Upload successful");
          } catch (error) {
            const userResponse = prompt("File already exists. Would you like to overwrite it? (yes/no)");

            if (userResponse === null) {
              setUploadStatus("Upload cancelled");
              return;
            }

            if (userResponse.toLowerCase() === "yes") {
              overwrite = true;
              try {
                await uploadFile(file, newFileName, overwrite);
                setUploadStatus("Upload successful");
              } catch (error) {
                console.error("Error uploading file:", error);
                setUploadStatus("Upload failed");
              }
            } else if (userResponse.toLowerCase() === "no") {
              newFileName = prompt("Enter a new file name");

              if (newFileName === null || newFileName.trim() === "") {
                setUploadStatus("Upload cancelled");
                return;
              }

              try {

               if (!newFileName.includes(".csv") && !newFileName.includes(".pcap")) {
                  newFileName = newFileName + (file.name.includes(".csv") ? ".csv" : ".pcap");
                }

                if(newFileName.includes(".csv") && !file.name.includes(".csv")) {
                  setUploadStatus("Invalid response. Upload cancelled.");
                  return;
                }

                await uploadFile(file, newFileName, overwrite);
                setUploadStatus("Upload successful");
              } catch (error) {
                console.error("Error uploading file:", error);
                setUploadStatus("Upload failed");
              }
            } else {
              setUploadStatus("Invalid response. Upload cancelled.");
            }
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
          {uploadStatus || "Drag and drop a CSV or a PCAP file here, or click to upload"}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
