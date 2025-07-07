import { useEffect, useState } from "react";
import userStore from "~/store";

// Define session data type based on API response
type SessionData = {
  _id: string;
  sessionID: string;
  clicks: number;
  deviceType: string;
  focusLossCount: number;
  sessionDuration: number;
  sessionStart: number;
  siteID: string;
  createdAt: string;
  updatedAt: string;
};

export default function () {
  const selectedSiteID = userStore((s) => s.siteID);
  const token = userStore((s) => s.token);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format duration in milliseconds to readable format
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${minutes} minutes`;
    }
    return `${hours} hours, ${remainingMinutes} minutes`;
  };

  // Calculate bounce rate (focusLoss / clicks)
  const calculateBounceRate = (focusLoss: number, clicks: number) => {
    return clicks === 0 ? 0 : (focusLoss / clicks).toFixed(1);
  };

  useEffect(() => {
    if (!selectedSiteID) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:3000/api/sessionreports?siteid=${selectedSiteID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.message || "Failed to fetch session reports");
        } else {
          setSessions(data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch session reports:", err);
        setError(err.message || "Failed to fetch session reports");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedSiteID, token]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!selectedSiteID) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="alert alert-warning max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Please select a website first</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="detailed-reports"
      className="w-full grid gap-4 h-full bg-base-300 p-4">
      <div className="overflow-x-auto col-span-4 bg-base-100 rounded-lg shadow-md">
        <table className="table table-zebra w-full">
          <thead className="sticky top-0 bg-base-200">
            <tr>
              <th>Session ID</th>
              <th>Device</th>
              <th>Bounce Rate</th>
              <th>Clicks</th>
              <th>Duration</th>
              <th>Start Time</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No session data available
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session._id} className="hover">
                  <td className="font-mono">{session.sessionID}</td>
                  <td>
                    <div className="badge badge-outline">
                      {session.deviceType}
                    </div>
                  </td>
                  <td>
                    {calculateBounceRate(
                      session.focusLossCount,
                      session.clicks
                    )}
                  </td>
                  <td>{session.clicks}</td>
                  <td>{formatDuration(session.sessionDuration)}</td>
                  <td>{new Date(session.sessionStart).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
