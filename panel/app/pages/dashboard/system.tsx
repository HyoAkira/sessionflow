import { useEffect, useState } from "react";
import userStore from "~/store";

interface Website {
  siteID: string;
  siteURL: string;
  siteName: string;
  createdAt: string;
}

export default function System() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelReloadLoading, setModelReloadLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = userStore((s) => s.token);

  useEffect(() => {
    fetchWebsites();
  }, [token]);

  const fetchWebsites = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/getsites", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.error) {
        setError(data.message || "Failed to fetch websites");
      } else {
        setWebsites(data.data || []);
      }
    } catch (err) {
      setError("Failed to fetch websites");
      console.error("Error fetching websites:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebsite = async (siteID: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this website? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Note: You'll need to add a delete endpoint to your router
      const response = await fetch(`http://localhost:3000/api/deletesite`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ siteID }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.message || "Failed to delete website");
      } else {
        setWebsites(websites.filter((site) => site.siteID !== siteID));
        // Show success message
        const successAlert = document.createElement("div");
        successAlert.className =
          "alert alert-success fixed top-4 right-4 z-50 w-auto";
        successAlert.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Website deleted successfully</span>
        `;
        document.body.appendChild(successAlert);
        setTimeout(() => successAlert.remove(), 3000);
      }
    } catch (err) {
      setError("Failed to delete website");
      console.error("Error deleting website:", err);
    }
  };

  const handleRegenerateCode = async (website: Website) => {
    setGeneratingCode(website.siteID);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:3000/api/regeneratewebsitecode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ siteID: website.siteID }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.message || "Failed to generate code");
      } else {
        setGeneratedCode(data.data.code);
        setSelectedWebsite(website);
        setShowCodeModal(true);
      }
    } catch (err) {
      setError("Failed to generate code");
      console.error("Error generating code:", err);
    } finally {
      setGeneratingCode(null);
    }
  };

  const handleReloadModels = async () => {
    setModelReloadLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/modelreload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.message || "Failed to reload models");
      } else {
        // Show success message
        const successAlert = document.createElement("div");
        successAlert.className =
          "alert alert-success fixed top-4 right-4 z-50 w-auto";
        successAlert.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>ML models reloaded successfully</span>
        `;
        document.body.appendChild(successAlert);
        setTimeout(() => successAlert.remove(), 3000);
      }
    } catch (err) {
      setError("Failed to reload models");
      console.error("Error reloading models:", err);
    } finally {
      setModelReloadLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    const successAlert = document.createElement("div");
    successAlert.className =
      "alert alert-success fixed top-4 right-4 z-50 w-auto";
    successAlert.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Code copied to clipboard</span>
    `;
    document.body.appendChild(successAlert);
    setTimeout(() => successAlert.remove(), 2000);
  };

  const downloadCode = (code: string, websiteName: string) => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        `// SessionFlow Tracking Script\n\n${code}\n\n// End SessionFlow Tracking Script`,
      ],
      { type: "text/javascript" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `sessionflow-tracker-${websiteName.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}.js`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full h-full bg-base-300 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-base-100 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">System Management</h1>
          <p className="text-gray-600">
            Manage your websites and system settings
          </p>
        </div>

        {/* Error Alert */}
        {error && (
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
        )}

        {/* ML Models Section */}
        <div className="bg-base-100 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">ML Models</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                Reload machine learning models to apply latest changes
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This will refresh all sentiment analysis and segmentation models
              </p>
            </div>
            <button
              className={`btn btn-accent ${
                modelReloadLoading ? "loading" : ""
              }`}
              onClick={handleReloadModels}
              disabled={modelReloadLoading}>
              {modelReloadLoading ? "Reloading..." : "Reload Models"}
            </button>
          </div>
        </div>

        {/* Websites Section */}
        <div className="bg-base-100 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Website Management</h2>
            <button
              className={`btn btn-ghost ${loading ? "loading" : ""}`}
              onClick={fetchWebsites}
              disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : websites.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No websites found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Website Name</th>
                    <th>URL</th>
                    <th>Site ID</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {websites.map((website) => (
                    <tr key={website.siteID}>
                      <td className="font-medium">{website.siteName}</td>
                      <td>{website.siteURL}</td>
                      <td>
                        <code className="bg-base-200 px-2 py-1 rounded text-sm">
                          {website.siteID}
                        </code>
                      </td>
                      <td>
                        {new Date(website.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className={`btn btn-sm btn-info ${
                              generatingCode === website.siteID ? "loading" : ""
                            }`}
                            onClick={() => handleRegenerateCode(website)}
                            disabled={generatingCode === website.siteID}>
                            {generatingCode === website.siteID
                              ? "Generating..."
                              : "Get Code"}
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleDeleteWebsite(website.siteID)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Code Modal */}
        {showCodeModal && (
          <div
            className="modal modal-open"
            onClick={(e) => {
              // Close modal when clicking on backdrop
              if (e.target === e.currentTarget) {
                setShowCodeModal(false);
                setGeneratedCode(null);
                setSelectedWebsite(null);
              }
            }}>
            <div className="modal-box max-w-2xl w-11/12 max-h-[90vh] p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">
                  Tracking Code for {selectedWebsite?.siteName}
                </h3>
                <button
                  className="btn btn-sm btn-circle"
                  onClick={() => {
                    setShowCodeModal(false);
                    setGeneratedCode(null);
                    setSelectedWebsite(null);
                  }}>
                  ✕
                </button>
              </div>
              <div className="bg-base-200 p-4 rounded-lg mb-4 max-h-60 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap break-words">
                  <code>{generatedCode}</code>
                </pre>
              </div>
              <div className="modal-action gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    generatedCode && copyToClipboard(generatedCode)
                  }>
                  Copy to Clipboard
                </button>
                <button
                  className="btn btn-success"
                  onClick={() =>
                    generatedCode &&
                    selectedWebsite &&
                    downloadCode(generatedCode, selectedWebsite.siteName)
                  }>
                  Download Code
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setShowCodeModal(false);
                    setGeneratedCode(null);
                    setSelectedWebsite(null);
                  }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
