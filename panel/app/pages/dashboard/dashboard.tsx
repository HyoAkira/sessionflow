import { Link, Navigate } from "react-router";
import type { Route } from "../../+types/root";
import userStore from "~/store";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard - SessionFlow" }];
}

export default function () {
  const [liveuserCount, setLiveUserCount] = useState(0);

  const token = userStore((s) => s.token);
  const [websites, setWebsites] = useState([]);
  const selectedSiteID = userStore((s) => s.siteID);
  const setSelectedSiteID = userStore((s) => s.setSiteID);
  useEffect(() => {
    const fetchLiveUsers = () => {
      fetch(`http://localhost:3000/api/liveusers?siteid=${selectedSiteID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setLiveUserCount(data.count);
          }
        })
        .catch((err) => console.error("Failed to fetch live users:", err));
    };

    const interval = setInterval(fetchLiveUsers, 30000);
    fetchLiveUsers(); // Initial fetch

    return () => clearInterval(interval);
  }, [selectedSiteID, token]);
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
        }
      })
      .catch((err) => {
        console.error("Failed to fetch websites:", err);
      });
  }, [token]);

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
          25
        </div>
        <div className="mt-2">
          25 visits and 48 actions in the last 3 minutes
        </div>
      </div>

      <div
        id="live-users"
        className="flex flex-col h-36 rounded-xl bg-base-200 gap-0 justify-center p-4">
        <div className="text-xl font-bold">Visits</div>
        <div className="bg-base-100 h-18 w-18 text-2xl mx-auto text-center flex justify-center items-center rounded-lg">
          125
        </div>
        <div className="mt-2">10,331 visits, 9,356 unique visitors -5.9%</div>
      </div>
    </div>
  );
}
