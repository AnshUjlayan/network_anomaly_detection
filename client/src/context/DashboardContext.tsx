import React, { createContext, useContext, useState } from "react";

interface DashboardContextProps {
  fileList: string[];
  setFileList: React.Dispatch<React.SetStateAction<string[]>>;
  uploadedFile: File | null;
  setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>;
  csvData: string[][];
  setCsvData: React.Dispatch<React.SetStateAction<string[][]>>;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(
  undefined,
);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fileList, setFileList] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);

  return (
    <DashboardContext.Provider
      value={{
        fileList,
        setFileList,
        uploadedFile,
        setUploadedFile,
        csvData,
        setCsvData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboardContext must be used within a DashboardProvider",
    );
  }
  return context;
};
