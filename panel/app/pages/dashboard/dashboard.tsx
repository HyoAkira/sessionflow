import { Link, Navigate } from "react-router";
import type { Route } from "../../+types/root";
import userStore from "~/store";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard - SessionFlow" }];
}

export default function () {
  const [liveuserCount, setLiveUserCount] = useState(0);
  const [dateRange, setDateRange] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sessionData, setSessionData] = useState([]);

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
          setSessionData(data.data);
        }
      })
      .catch((err) =>
        console.error(`Failed to fetch ${dateRange} session reports:`, err)
      );

    return () => {};
  }, [selectedSiteID, token, dateRange, startDate, endDate]);

  // Process data for the chart based on date range
  const getChartData = () => {
    if (!sessionData.length) return [];

    const groupedData = {};
    let dateFormat;

    switch (dateRange) {
      case "daily":
        // Format by hour for daily view
        dateFormat = (date) => {
          const d = new Date(date);
          // Format as "HH:00" to show hourly intervals
          return d.getHours().toString().padStart(2, "0") + ":00";
        };
        break;
      case "weekly":
      case "custom":
        dateFormat = (date) => new Date(date).toLocaleDateString();
        break;
      case "monthly":
        dateFormat = (date) => {
          const d = new Date(date);
          return `${d.getDate()}/${d.getMonth() + 1}`;
        };
        break;
      default:
        dateFormat = (date) => new Date(date).toLocaleDateString();
    }

    // For daily view, create all hours of the day first
    if (dateRange === "daily") {
      // Initialize with all 24 hours
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, "0") + ":00";
        groupedData[hour] = 0;
      }
    }

    sessionData.forEach((session) => {
      const dateKey = dateFormat(session.createdAt);
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = 1;
      } else {
        groupedData[dateKey]++;
      }
    });

    // For daily view, ensure data is sorted by hour
    if (dateRange === "daily") {
      return Object.keys(groupedData)
        .sort((a, b) => {
          // Sort by hour
          const hourA = parseInt(a.split(":")[0]);
          const hourB = parseInt(b.split(":")[0]);
          return hourA - hourB;
        })
        .map((date) => ({
          date,
          visits: groupedData[date],
        }));
    }

    return Object.keys(groupedData).map((date) => ({
      date,
      visits: groupedData[date],
    }));
  };

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
      className="w-full grid grid-cols-3 grid-rows-[auto_auto_1fr] gap-4 h-full bg-base-300 p-4">
      <div className="bg-base-200 col-span-3 px-4 flex items-center h-12 justify-between rounded-xl">
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
              <Link to="/dashboard/websiteadd/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Add website
              </Link>
            </li>
            <li>
              <Link to="/dashboard/system/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                System
              </Link>
            </li>
          </ul>
        </details>
      </div>

      <div
        id="live-users"
        className="flex flex-col h-36 rounded-xl bg-base-200 gap-0 justify-center p-4">
        <div className="text-xl font-bold flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          Live User Count
        </div>
        <div className="bg-base-100 h-18 w-18 text-2xl mx-auto text-center flex justify-center items-center rounded-lg">
          {liveuserCount ? liveuserCount : 0}
        </div>
        <div className="mt-2 text-base-content">
          Live users active in the last 3 minutes. This count updates
          automatically.
        </div>
      </div>

      <div
        id="visits"
        className="flex flex-col h-36 rounded-xl bg-base-200 gap-0 justify-center p-4">
        <div className="text-xl font-bold flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
            />
          </svg>
          Visits
        </div>
        <div className="bg-base-100 h-18 w-18 text-2xl mx-auto text-center flex justify-center items-center rounded-lg">
          {visit}
        </div>
        <div className="mt-2 text-base-content">
          {visit} unique visits in the selected time period.
        </div>
      </div>

      {/* New Visit Graph - completely redesigned */}
      <div className="col-span-3 rounded-xl bg-base-100 shadow-md p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-base-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-blue-600">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
            />
          </svg>
          <span>Visit Trend: </span>
          <span className="text-blue-600 font-semibold">{dateRange}</span>
        </h2>
        <div className="h-96 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getChartData()}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              barSize={30}>
              <CartesianGrid vertical={false} stroke="var(--base-300)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--base-content)", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--base-content)", fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                contentStyle={{
                  backgroundColor: "var(--base-100)",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "12px",
                }}
                labelStyle={{
                  fontSize: 14,
                  fontWeight: "bold",
                  color: "var(--base-content)",
                  marginBottom: "8px",
                  borderBottom: "1px solid var(--base-300)",
                  paddingBottom: "6px",
                }}
                formatter={(value) => [
                  <div className="flex items-center gap-2 py-1">
                    <div className="bg-blue-600 w-3 h-3 rounded-full"></div>
                    <div className="font-bold text-blue-600 text-lg">
                      {value}
                    </div>
                    <div className="text-base-content text-sm">visits</div>
                  </div>,
                ]}
              />
              <Bar
                dataKey="visits"
                name="Visits"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-out">
                {getChartData().map((entry, index) => (
                  <g key={`cell-${index}`}>
                    <defs>
                      <linearGradient
                        id={`colorBar${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                          offset="0%"
                          stopColor="#2563eb"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#60a5fa"
                          stopOpacity={0.8}
                        />
                      </linearGradient>
                    </defs>
                    <rect
                      x={0}
                      y={0}
                      width={0}
                      height={0}
                      fill={`url(#colorBar${index})`}
                      stroke="none"
                    />
                  </g>
                ))}
                {getChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#colorBar${index})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
