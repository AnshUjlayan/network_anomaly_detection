import React from "react";
import Layout from "@theme/Layout";
import PieChart from "../components/PieChart/PieChart";
const Dashboard: React.FC = () => {
  return (
    <Layout title="Test Network">
      <div>
        <h1>Test Network</h1>
        <p>This is a test network page.</p>
        <div style={{ width: "100%", height: "400px" }}>
          <PieChart />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
