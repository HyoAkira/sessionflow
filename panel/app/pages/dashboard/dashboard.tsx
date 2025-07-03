import { Link, Navigate } from "react-router";
import type { Route } from "../../+types/root";
import userStore from "~/store";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard - SessionFlow" }];
}

export default function () {
  const [liveuserCount, setLiveUserCount] = useState(0);
  const [dateRange, setDateRange] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = userStore((s) => s.token);
  const [websites, setWebsites] = useState([]);
  const selectedSiteID = userStore((s) => s.siteID);
  const setSelectedSiteID = userStore((s) => s.setSiteID);
  const [visit, setVisits] = useState(0);
  useEffect(() => {
    fetch("http://localhost:3000/api/getsites", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Error fetching websites:", data.message);
        } else {
          console.log("Websites fetched successfully:", data.data);
          setWebsites(data.data);
          if (data.data.length === 1 && !selectedSiteID) {
            setSelectedSiteID(data.data[0].siteID);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch websites:", err);
      });
  }, [token]);
  /**
   * LIVEUSERS
   */
  useEffect(() => {
    const fetchLiveUsers = () => {
      console.log("Fetching");
      if (!selectedSiteID) return;
      fetch(`http://localhost:3000/api/liveusers?siteid=${selectedSiteID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setLiveUserCount(data.data.liveUserCount);
          }
        })
        .catch((err) => console.error("Failed to fetch live users:", err));
    };

    const interval = setInterval(fetchLiveUsers, 180000);
    fetchLiveUsers(); // Initial fetch

    return () => clearInterval(interval);
  }, [selectedSiteID, token]);

  /**
   * VISITS
   */
  useEffect(() => {
    if (!selectedSiteID) return;

    let url = "";

    switch (dateRange) {
      case "daily":
        url = `http://localhost:3000/api/dailysessionsreport?siteid=${selectedSiteID}`;
        break;
      case "weekly":
        url = `http://localhost:3000/api/weeklysessionsreport?siteid=${selectedSiteID}`;
        break;
      case "monthly":
        url = `http://localhost:3000/api/monthlysessionsreport?siteid=${selectedSiteID}`;
        break;
      case "custom":
        if (startDate && endDate) {
          url = `http://localhost:3000/api/rangesessionsreport?siteid=${selectedSiteID}&start=${startDate}&end=${endDate}`;
        } else {
          console.error("Custom date range selected but dates not provided");
          return;
        }
        break;
      default:
        url = `http://localhost:3000/api/dailysessionsreport?siteid=${selectedSiteID}`;
    }

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw data.error;
        } else {
          setVisits(data.data.length);
        }
      })
      .catch((err) =>
        console.error(`Failed to fetch ${dateRange} session reports:`, err)
      );

    return () => {};
  }, [selectedSiteID, token, dateRange, startDate, endDate]);

  if (websites.length == 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">No websites found</h1>
        <Link to="/dashboard/websiteadd/" className="btn btn-primary">
          Add a website
        </Link>
      </div>
    );
  }
  return (
    <div
      id="dashboard"
      className="w-full grid grid-cols-3 grid-rows-[1fr_7fr] gap-4 h-full bg-base-300 p-4">
      <div className=" bg-base-200 col-span-4  px-4 flex items-center h-12 justify-between rounded-xl">
        <div className="w-full flex gap-4">
          <select
            className="select select-bordered w-full max-w-xs"
            value={selectedSiteID || ""}
            onChange={(e) => setSelectedSiteID(e.target.value)}>
            {websites.map((site: { siteID: string; siteURL: string }) => (
              <option key={site.siteID} value={site.siteID}>
                {site.siteURL}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered max-w-xs"
            defaultValue="daily"
            onChange={(e) => {
              const value = e.target.value;
              setDateRange(value);
            }}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {dateRange === "custom" && (
            <div className="flex gap-2 items-center">
              <input
                type="date"
                className="input input-bordered"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start date"
              />
              <span>to</span>
              <input
                type="date"
                className="input input-bordered"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End date"
              />
            </div>
          )}
        </div>

        <details className="dropdown dropdown-left">
          <summary className="btn m-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
              />
            </svg>
          </summary>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 w-34 rounded-box z-1 p-2 shadow-sm">
            <li>
              <Link to="/dashboard/websiteadd/">Add website</Link>
            </li>
            <li>
              <Link to="/dashboard/">System</Link>
            </li>
          </ul>
        </details>
      </div>
      <div
        id="live-users"
        className="flex flex-col h-36 rounded-xl bg-base-200 gap-0 justify-center p-4">
        <div className="text-xl font-bold">Live User Count</div>
        <div className="bg-base-100 h-18 w-18 text-2xl mx-auto text-center flex justify-center items-center rounded-lg">
          {liveuserCount ? liveuserCount : 0}
        </div>
        <div className="mt-2 text-base-content">
          Live users active in the last 3 minutes. This count updates
          automatically.
        </div>
      </div>

      <div
        id="live-users"
        className="flex flex-col h-36 rounded-xl bg-base-200 gap-0 justify-center p-4">
        <div className="text-xl font-bold">Visits</div>
        <div className="bg-base-100 h-18 w-18 text-2xl mx-auto text-center flex justify-center items-center rounded-lg">
          {visit}
        </div>
        <div className="mt-2">{visit} unique visits.</div>
      </div>
    </div>
  );
}
