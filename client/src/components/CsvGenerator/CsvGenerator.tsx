import React, { useState, useEffect } from "react";
import { CiAlarmOn } from "react-icons/ci";
import styles from "./CsvGenerator.module.css";
import { getInterfaceList, generateCsv } from "../../api/api";

const CsvGenerator: React.FC = () => {
  const [firstOption, setFirstOption] = useState<string | null>(null);
  const [secondOption, setSecondOption] = useState<number | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState<boolean>(false);
  const [interfaceList, setInterfaceList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterfaceList = async () => {
      try {
        const interfaces = await getInterfaceList();
        console.log("Fetched interfaces:", interfaces);
        if (Array.isArray(interfaces)) {
          setInterfaceList(interfaces);
        } else {
          setError("Received invalid data from the server");
        }
      } catch (error) {
        console.error("Error fetching interface list", error);
        setError("Failed to fetch interface list");
      }
    };

    fetchInterfaceList();
  }, []);

  const handleFirstOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFirstOption(e.target.value);
  };

  const handleSecondOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSecondOption(parseInt(e.target.value, 10));
  };

  const handleButtonClick = () => {
    if (firstOption && secondOption) {
      generateCsv(firstOption, secondOption);
      setTimer(secondOption);
      setShowTimer(true); 
    }
  };

  const handleGoBackClick = () => {
    setFirstOption(null);
    setSecondOption(null);
    setShowTimer(false); 
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => (prevTimer ? prevTimer - 1 : null));
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className={styles.csvGenerator}>
      {!showTimer ? (
        <>
          <div className={styles.dropbox}>
            <label htmlFor="firstOption">Select Interface:</label>
            <select id="firstOption" onChange={handleFirstOptionChange} value={firstOption || ""}>
              <option value="">Select an option</option>
              {Array.isArray(interfaceList) && interfaceList.map((interfaceName) => (
                <option key={interfaceName} value={interfaceName}>
                  {interfaceName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.dropbox}>
            <label htmlFor="secondOption">Select Duration:</label>
            <select id="secondOption" onChange={handleSecondOptionChange} value={secondOption || ""}>
              <option value="">Select duration</option>
              <option value="10">10 seconds</option>
              <option value="20">20 seconds</option>
              <option value="30">30 seconds</option>
            </select>
          </div>

          <button
            className={styles.generateButton}
            onClick={handleButtonClick}
            disabled={!firstOption || !secondOption}
          >
            Generate CSV
          </button>
        </>
      ) : (
        <>
          {timer !== null && timer > 0 ? (
            <div className={styles.timer}>
                <CiAlarmOn className={styles.clock}/>
              <p>Time remaining: {timer} seconds</p>
            </div>
          ) : (
            <div className={styles.timerComplete}>
              <p>CSV Generation Complete!</p>
              <button className={styles.goBackButton} onClick={handleGoBackClick}>
                Go Back
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CsvGenerator;
