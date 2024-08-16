import React, { useEffect } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDashboardContext } from "../../context/DashboardContext";

const Example: React.FC = () => {
  const { dataTransfer } = useDashboardContext();
  useEffect(() => {}, [dataTransfer]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      {dataTransfer?.length === 0 ? (
        <p style={{ textAlign: "center" }}>No data to display</p>
      ) : (
        <BarChart
          width={500}
          height={300}
          data={dataTransfer}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Subflow Forward Bytes" stackId="a" fill="#8884d8" />
          <Bar
            dataKey="Total Length Forward Packets"
            stackId="a"
            fill="#82ca9d"
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};

export default Example;
