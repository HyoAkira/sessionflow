import { useEffect, useState } from "react";
import userStore from "~/store";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// endpointler icin tipler
type SegmentData = {
  clicks: number;
  deviceType_desktop: number;
  deviceType_tablet: number;
  focusLossCount: number;
  gender_NULL: number;
  gender_true: number;
  max_price: number;
  min_price: number;
  pageDuration: number;
  segment: number;
  sessionDuration: number;
};

type ShoppingData = {
  decreasing: number;
  increasing: number;
  stable: number;
};

type DepressionData = {
  anger: number;
  depression: number;
  fear: number;
  joy: number;
  love: number;
  sad: number;
  suprise: number;
};
// type union
type ReportData = SegmentData[] | ShoppingData | DepressionData;

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

// Colors for pie charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#FF6B6B",
  "#6A7FDB",
];

// Report type descriptions
const reportDescriptions = {
  segment2:
    "Segment 2 analysis groups users by behavior patterns using 2 clusters.",
  segment3:
    "Segment 3 analysis groups users by behavior patterns using 3 clusters.",
  segment5:
    "Segment 5 analysis groups users by behavior patterns using 5 clusters.",
  shopping:
    "Shopping behavior analysis categorizes users by their purchasing trends.",
  depression:
    "Sentiment analysis detects emotional patterns in user comments and messages.",
};

export default function DetailedReports() {
  const selectedSiteID = userStore((s) => s.siteID);
  const token = userStore((s) => s.token);
  const [reportType, setReportType] = useState<string>("segment2");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data based on selected report type
  useEffect(() => {
    if (!selectedSiteID || !token) return;

    setLoading(true);
    setError(null);
    setData(null); // Clear previous data

    fetch(`http://localhost:3000/api/${reportType}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ siteid: selectedSiteID }),
    })
      .then((res) => res.json())
      .then((responseData) => {
        if (responseData.error) {
          throw new Error(responseData.message || "Failed to fetch data");
        }
        setData(responseData);
      })
      .catch((err) => {
        console.error(`Failed to fetch ${reportType} data:`, err);
        setError(err.message || `Failed to fetch ${reportType} data`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [reportType, selectedSiteID, token]);

  // Render segment data as a table
  const renderSegmentTable = (segmentData: SegmentData[]) => {
    if (segmentData.length === 0) {
      return (
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No segment data available for analysis</span>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Clicks</th>
              <th>Desktop %</th>
              <th>Tablet %</th>
              <th>Focus Loss</th>
              <th>Gender (M) %</th> {/* Add this column */}
              <th>Unknown Gender %</th> {/* Add this column */}
              <th>Price Range</th>
              <th>Page Duration</th>
              <th>Session Duration</th>
            </tr>
          </thead>
          <tbody>
            {segmentData.map((segment, index) => (
              <tr key={index} className="hover">
                <td className="font-semibold">Cluster {segment.segment}</td>
                <td>{segment.clicks.toFixed(2)}</td>
                <td>{segment.deviceType_desktop.toFixed(2)}%</td>
                <td>{segment.deviceType_tablet.toFixed(2)}%</td>
                <td>{segment.focusLossCount.toFixed(2)}</td>
                <td>{segment.gender_true.toFixed(2)}%</td> {/* Add this cell */}
                <td>{segment.gender_NULL.toFixed(2)}%</td> {/* Add this cell */}
                <td>
                  ${segment.min_price.toFixed(2)} - $
                  {segment.max_price.toFixed(2)}
                </td>
                <td>{formatDuration(segment.pageDuration)}</td>
                <td>{formatDuration(segment.sessionDuration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render pie chart for shopping or depression data
  const renderPieChart = (data: Record<string, number>, title: string) => {
    const pieData = Object.entries(data)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
      .filter((item) => item.value > 0); // Only show non-zero values

    if (pieData.length === 0) {
      return (
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No data available for {title.toLowerCase()}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center py-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} instances`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render different visualizations based on report type
  const renderVisualization = () => {
    if (!data) return null;

    // Handle segment data (array of objects)
    if (Array.isArray(data) && (data.length === 0 || "segment" in data[0])) {
      return renderSegmentTable(data as SegmentData[]);
    }

    // Handle shopping data
    else if (!Array.isArray(data) && "decreasing" in data) {
      return renderPieChart(data as ShoppingData, "Shopping Behavior Analysis");
    }

    // Handle depression/sentiment data
    else if (!Array.isArray(data) && "depression" in data) {
      return renderPieChart(data as DepressionData, "Sentiment Analysis");
    }

    // If we can't identify the data type
    return (
      <div className="alert alert-warning">
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
        <span>Unable to visualize this data type</span>
      </div>
    );
  };

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
    <div className="w-full grid gap-4 h-full bg-base-300 p-4">
      <div className="bg-base-100 rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold">Detailed Analytics Reports</h2>
            <p className="text-gray-500 mt-1">
              {
                reportDescriptions[
                  reportType as keyof typeof reportDescriptions
                ]
              }
            </p>
          </div>
          <select
            className="select select-bordered w-full md:w-auto"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}>
            <option value="segment2">Segment 2 Analysis</option>
            <option value="segment3">Segment 3 Analysis</option>
            <option value="segment5">Segment 5 Analysis</option>
            <option value="shopping">Shopping Behavior</option>
            <option value="depression">Sentiment Analysis</option>
          </select>
        </div>

        {loading ? (
          <div className="w-full py-12 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
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
        ) : (
          renderVisualization()
        )}
      </div>
    </div>
  );
}
