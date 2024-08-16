import React, { useState } from "react";
import styles from "./TabLayout.module.css";

interface TabProps {
  label: string;
  content: React.ReactNode;
}

interface TabLayoutProps {
  TabLayout: TabProps[];
}

const TabLayout: React.FC<TabLayoutProps> = ({ TabLayout }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.TabLayoutContainer}>
      <div className={styles.tabList}>
        {TabLayout.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tabButton} ${
              activeTab === index ? styles.active : ""
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>
        {TabLayout[activeTab].content}
      </div>
    </div>
  );
};

export default TabLayout;
