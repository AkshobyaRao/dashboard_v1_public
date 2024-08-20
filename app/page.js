"use client";
import React, { useState, useEffect } from "react";
import "../app/global.css";

export default function Home() {
  const [data, setData] = useState(
    () => JSON.parse(localStorage.getItem("data")) || []
  );
  const [backupData, setBackupData] = useState(
    () => JSON.parse(localStorage.getItem("backupData")) || []
  );
  const [cashback, setCashback] = useState(
    () => JSON.parse(localStorage.getItem("cashback")) || {}
  );
  const [commit, setCommit] = useState(
    () => JSON.parse(localStorage.getItem("commit")) || {}
  );
  const [tooltip, setTooltip] = useState(
    () => JSON.parse(localStorage.getItem("tooltip")) || {}
  );
  const [input, setInput] = useState(
    () => JSON.parse(localStorage.getItem("input")) || {}
  );
  const [sort, setSort] = useState(
    () => JSON.parse(localStorage.getItem("sort")) || false
  );
  const [finalData, setFinalData] = useState(backupData);

  async function fetchCashback() {
    try {
      const res = await fetch("/api/getCashbackMonitorData");
      if (!res.ok) {
        throw new Error("Err:");
      }
      const cashbackData = await res.json();
      setCashback(cashbackData);
      localStorage.setItem("cashback", JSON.stringify(cashbackData)); // Save to local storage
    } catch (error) {
      console.log("there was an err" + error);
    }
  }

  async function fetchSpreadSheetData() {
    try {
      const res = await fetch("/api/getSpreadSheetData");
      if (!res.ok) {
        throw new Error("Err:");
      }
      const data2 = await res.json();
      setData(data2);
      setBackupData(data2);
      localStorage.setItem("data", JSON.stringify(data2)); // Save to local storage
      localStorage.setItem("backupData", JSON.stringify(data2)); // Save to local storage
    } catch (error) {
      console.log("there was an err");
    }
  }

  useEffect(() => {
    fetchSpreadSheetData();
  }, []);

  useEffect(() => {
    fetchCashback();
  }, []);

  useEffect(() => {
    localStorage.setItem("commit", JSON.stringify(commit)); // Save to local storage
  }, [commit]);

  useEffect(() => {
    localStorage.setItem("tooltip", JSON.stringify(tooltip)); // Save to local storage
  }, [tooltip]);

  useEffect(() => {
    localStorage.setItem("input", JSON.stringify(input)); // Save to local storage
  }, [input]);

  function CommitToItem(key) {
    setCommit((prevState) => ({
      ...prevState,
      [key]: !commit[key],
    }));
  }

  function LoadTooltip(key) {
    setTooltip((prevState) => ({
      ...prevState,
      [key]: !tooltip[key],
    }));
  }

  function callAPIs() {
    fetchCashback();
    fetchSpreadSheetData();
  }

  function sorting() {
    setSort(!sort);
  }

  useEffect(() => {
    if (sort == false) {
      const sort = [...data].sort((a, b) => {
        const statusOrder = {
          active: 1,
          inactive: 3,
          oos: 2,
        };
        return statusOrder[a[1]] - statusOrder[b[1]];
      });
      setFinalData(sort);
    } else {
      setFinalData(data);
    }
  }, [sort, backupData, data]);

  function HandleOnChange(key, event) {
    setInput((prevState) => ({
      ...prevState,
      [key]: event.target.value,
    }));
  }

  return (
    <main>
      <button className="refresh_btn" onClick={() => callAPIs()}>
        Refresh
      </button>
      <button className="sort_btn" onClick={() => sorting()}>
        Sort
      </button>
      <a className="commit_link" href="https://form.flyupdeal.com/">
        Commit Link
      </a>
      <table className="container">
        <tbody>
          {finalData.map((item, index) => {
            const [
              date,
              status,
              itemName,
              cost,
              pay,
              payNoDisc,
              googleForms,
              itemLink,
              description,
            ] = item;
            const isCommitted = commit[itemName];
            const payTooltip = tooltip[pay];
            const payNoDiscTooltip = tooltip[payNoDisc];
            const itemLinkTooltip = tooltip[itemLink];
            const itemCompanyTooltip = tooltip[itemName];
            let cbPercent = 0;
            let coupon = 0;
            if (cashback[itemLink]?.[1] == "dell") {
              coupon = 0.1;
            } else {
              coupon = 0;
            }
            if (cashback[itemLink]?.[0]?.cashbackPercentage == "") {
              cbPercent = 0;
            } else {
              cbPercent = cashback[itemLink]?.[0]?.cashbackPercentage;
            }
            const outOfPocket =
              parseInt(pay) -
              parseInt(pay) * (parseInt(cbPercent) / 100) +
              0.0625 * parseInt(pay) -
              parseInt(pay) * coupon;
            return (
              <tr
                key={index}
                className={
                  isCommitted
                    ? "yes_committed " + item[0]
                    : "not_committed " + item[0]
                }
              >
                {/* <td className="date">{date}</td> */}
                <td
                  className={
                    status === "active"
                      ? "status status_active"
                      : status === "oos"
                      ? "status status_oos"
                      : status === "inactive"
                      ? "status_inactive status"
                      : "status" // Default class if none of the above matches
                  }
                >
                  {status}
                </td>
                <td className="item">
                  <a href={itemLink}>{itemName}</a>
                </td>
                <td>
                  <div className="tool_tip_container">
                    <span
                      className={
                        payTooltip ? "tool_tip show" : "tool_tip hidden"
                      }
                    >
                      Disc
                    </span>
                    <button
                      className="cost"
                      onDoubleClick={() => LoadTooltip(pay)}
                    >
                      {pay}
                    </button>
                  </div>
                </td>
                <td>
                  <div className="tool_tip_container">
                    <span
                      className={
                        payNoDiscTooltip ? "tool_tip show" : "tool_tip hidden"
                      }
                    >
                      Base
                    </span>
                    <button
                      className="pay"
                      onDoubleClick={() => LoadTooltip(payNoDisc)}
                    >
                      {payNoDisc}
                    </button>
                  </div>
                </td>
                <td>
                  <div className="tool_tip_container">
                    <span
                      className={
                        itemCompanyTooltip ? "tool_tip show" : "tool_tip hidden"
                      }
                    >
                      Company
                    </span>
                    <button
                      className="company"
                      onDoubleClick={() => LoadTooltip(itemName)}
                    >
                      {cashback[itemLink]?.[1]}
                    </button>
                  </div>
                </td>
                <td>OOP: {outOfPocket.toFixed(2)}</td>
                {parseInt(payNoDisc) - outOfPocket <= 0 ? (
                  <td className="outcome">Loss</td>
                ) : (
                  <td className="outcome">Profit</td>
                )}
                <td>
                  {cashback[itemLink]?.[0]?.cashbackName}
                  {" - "}
                  {cashback[itemLink]?.[0]?.cashbackPercentage}
                </td>
                <td>
                  <input
                    value={input[itemName] || ""}
                    onChange={(event) => HandleOnChange(itemName, event)}
                    className="input"
                    placeholder="Tag #"
                  />
                </td>
                <td>
                  <button
                    className="refresh_btn"
                    onClick={() => CommitToItem(itemName)}
                  >
                    Commit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
