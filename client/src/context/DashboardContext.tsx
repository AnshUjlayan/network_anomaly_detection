import React, { createContext, useContext, useState } from "react";

interface DashboardContextProps {
  fileList: {
    page: number;
    limit: number;
    query: string;
    sort: string;
    order: string;
    total: number;
    files: { name: string; timestamp: string; size: string }[];
  };
  setFileList: React.Dispatch<
    React.SetStateAction<{
      page: number;
      limit: number;
      query: string;
      sort: string;
      order: string;
      total: number;
      files: { name: string; timestamp: string; size: string }[];
    }>
  >;

  // Graph data
  trafficConclusion: { name: string; value: number }[];
  setTrafficConclusion: React.Dispatch<
    React.SetStateAction<{ name: string; value: number }[]>
  >;
  packetRates: {
    Timestamp: string;
    "Forward Packets": number;
    "Backward Packets": number;
  }[];
  setPacketRates: React.Dispatch<
    React.SetStateAction<
      {
        Timestamp: string;
        "Forward Packets": number;
        "Backward Packets": number;
      }[]
    >
  >;
  latency: {
    Timestamp: string;
    "Mean IAT Forward": number;
    "Max IAT Forward": number;
    "Min IAT Forward": number;
  }[];
  setLatency: React.Dispatch<
    React.SetStateAction<
      {
        Timestamp: string;
        "Mean IAT Forward": number;
        "Max IAT Forward": number;
        "Min IAT Forward": number;
      }[]
    >
  >;
  dataTransfer: {
    Timestamp: string;
    "Subflow Forward Bytes": number;
    "Total Length Forward Packets": number;
  }[];
  setDataTransfer: React.Dispatch<
    React.SetStateAction<
      {
        Timestamp: string;
        "Subflow Forward Bytes": number;
        "Total Length Forward Packets": number;
      }[]
    >
  >;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(
  undefined,
);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fileList, setFileList] = useState<{
    page: number;
    limit: number;
    query: string;
    sort: string;
    order: string;
    total: number;
    files: { name: string; timestamp: string; size: string }[];
  }>({
    page: 1,
    limit: 5,
    query: "",
    sort: "timestamp",
    order: "desc",
    total: 0,
    files: [],
  });
  const [trafficConclusion, setTrafficConclusion] = useState<
    { name: string; value: number }[]
  >([]);
  const [packetRates, setPacketRates] = useState<
    {
      Timestamp: string;
      "Forward Packets": number;
      "Backward Packets": number;
    }[]
  >([]);
  const [latency, setLatency] = useState<
    {
      Timestamp: string;
      "Mean IAT Forward": number;
      "Max IAT Forward": number;
      "Min IAT Forward": number;
    }[]
  >([]);
  const [dataTransfer, setDataTransfer] = useState<
    {
      Timestamp: string;
      "Subflow Forward Bytes": number;
      "Total Length Forward Packets": number;
    }[]
  >([]);

  return (
    <DashboardContext.Provider
      value={{
        fileList,
        setFileList,
        trafficConclusion,
        setTrafficConclusion,
        packetRates,
        setPacketRates,
        latency,
        setLatency,
        dataTransfer,
        setDataTransfer,
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
