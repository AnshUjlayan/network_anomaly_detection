import React, { useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDashboardContext } from "../../context/DashboardContext";

const Example: React.FC = () => {
  const { packetRates } = useDashboardContext();
  useEffect(() => {}, [packetRates]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      {packetRates?.length === 0 ? (
        <p style={{ textAlign: "center" }}>No data to display</p>
      ) : (
        <LineChart
          width={500}
          height={300}
          data={packetRates}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Forward Packets" stroke="#8884d8" />
          <Line type="monotone" dataKey="Backward Packets" stroke="#82ca9d" />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};

export default Example;
