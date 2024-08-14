import React from "react";
import Layout from "@theme/Layout";
import PieChart from "../components/Charts/PieChart";
import LineChart from "../components/Charts/LineChart";
import BarChart from "../components/Charts/BarChart";
import AreaChart from "../components/Charts/AreaChart";
import styles from "./dashboard.module.css";

const Dashboard: React.FC = () => {
  return (
    <Layout title="Test Network">
      <div className={styles.container}>
        <div className={styles.box}>
          <h1>Welcome</h1>
          <p>
            This dashboard provides an interactive interface to analyze and
            visualize your network traffic. Upload your CSV file or create one
            using tcpdump, and our advanced model will classify the traffic into
            categories like benign, DOS, SQL injection, and more. Explore the
            real-time data through intuitive charts and gain insights into your
            network’s security status.
          </p>
        </div>
        <div className={styles.box}>
          <h1>Select Demo File</h1>
        </div>
        <div className={styles.box}>
          <h1>Upload File for Analysis</h1>
        </div>
        <div className={styles.box}>
          <h1>Packet Rates</h1>
          <div className={styles.chartContainer}>
            <LineChart />
          </div>
        </div>
        <div className={styles.box}>
          <h1>Traffic Conclusion</h1>
          <div className={styles.chartContainer}>
            <PieChart />
          </div>
        </div>
        <div className={styles.box}>
          <h1>Distribution of Total Forward Packet Lengths</h1>
          <div className={styles.chartContainer}>
            <BarChart />
          </div>
        </div>
        <div className={styles.box}>
          <h1>Latency Through Inter-Arrival Times</h1>
          <div className={styles.chartContainer}>
            <AreaChart />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
