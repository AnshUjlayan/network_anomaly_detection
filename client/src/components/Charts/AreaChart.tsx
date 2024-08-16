import React, { useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardContext } from "../../context/DashboardContext";

const Example: React.FC = () => {
  const { latency } = useDashboardContext();
  useEffect(() => {}, [latency]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      {latency?.length === 0 ? (
        <p style={{ textAlign: "center" }}>No data to display</p>
      ) : (
        <AreaChart
          width={500}
          height={400}
          data={latency}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Timestamp" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="Max IAT Forward"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
          />
          <Area
            type="monotone"
            dataKey="Min IAT Forward"
            stackId="1"
            stroke="#82ca9d"
            fill="#82ca9d"
          />
          <Area
            type="monotone"
            dataKey="Mean IAT Forward"
            stackId="1"
            stroke="#ffc658"
            fill="#ffc658"
          />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
};

export default Example;
