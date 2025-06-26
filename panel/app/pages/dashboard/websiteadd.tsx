import { useEffect, useRef, useState, type FormEvent } from "react";
import userStore from "~/store";
import type { TUser } from "../../../../restServer/schemas/user.schema";
import { Link, Navigate } from "react-router";

export default function () {
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState("");
  const token = userStore((s) => s.token);
  const userURL = useRef<string>("");
  const setToken = userStore((s) => s.setToken);
  const [user, setUser] = useState<TUser | null>(null);
  const [redirect, setRedirect] = useState(false);
  const [websiteCode, setWebsiteCode] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [copySuccess, setCopySuccess] = useState("");

  function handleCopy() {
    if (textAreaRef.current) {
      textAreaRef.current.select();
      document.execCommand("copy");
      setCopySuccess("Code copied to clipboard!");

      setTimeout(() => {
        setCopySuccess("");
      }, 2000);
    }
  }
  function handleDownload() {
    const element = document.createElement("a");
    const file = new Blob(
      [
        `// SessionFlow Tracking Script\n\n${websiteCode}\n\n// End SessionFlow Tracking Script`,
      ],
      { type: "text/javascript" }
    );
    element.href = URL.createObjectURL(file);
    element.download = "sessionflow-tracker.js";
    document.body.appendChild(element); // Firefox için gerekli
    element.click();
    document.body.removeChild(element);
  }
  useEffect(() => {
    // initial load ile ilk giris bounce edilir
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }
    if (!token) {
      console.error("No token found, redirecting to login.");
      setRedirect(true);
    }
    if (token) {
      console.log("Fetching user data with token:", token);
      fetch("http://localhost:3000/api/getuser", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error("Error fetching user data:", data.message);
            setToken("");
            setRedirect(true);
          } else {
            console.log("User data fetched successfully:", data.data);
            setUser(data.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch user data:", err);
          setToken("");
          setRedirect(true);
        });
    }

    return () => {};
  }, [token]);
  if (redirect) {
    return <Navigate to="/login" replace />;
  }

  //@ts-ignore
  function addWebsite(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const websiteName = formData.get("website-name");
    const websiteUrl = formData.get("website-url");
    userURL.current = websiteUrl as string;
    setHidden(!hidden);
    let siteID;
    fetch("http://localhost:3000/api/getwebsitecode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: websiteName,
        websiteURL: userURL.current,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Error adding website:", data.message);
          setError(data.message);
        } else {
          console.log("Website added successfully:", data.data);
          setWebsiteCode(data.data.code);
          fetch("http://localhost:3000/api/addsite", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: websiteName,
              websiteURL: userURL.current,
              siteID: data.data.siteID,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.error) {
                console.error("Error adding site:", data.message);
                setError(data.message);
              } else {
                console.log("Site added successfully:", data.message);
              }
            })
            .catch((err) => {
              console.error("Failed to add site:", err);
              setError("Failed to add site");
            });
        }
      })
      .catch((err) => {
        console.error("Failed to add website:", err);
        setError("Failed to add website");
      });
  }

  // //@ts-ignore
  // function testScript(e: MouseEvent<HTMLButtonElement>) {
  //   e.preventDefault();
  // }

  return (
    <div
      id="website-add"
      className="h-screen bg-base-300 flex flex-col gap-4 p-4">
      <div
        id="header"
        className="mx-auto my-4 text-4xl font-bold bg-base-200 w-full text-center py-2">
        <div>SessionFlow</div>
      </div>
      <div
        id="form"
        className={`flex flex-col gap-4 p-4 mx-auto w-1/3  ${
          hidden ? "hidden" : ""
        }`}>
        <div className="font-bold text-3xl mb-4 text-center">Add Website</div>

        <form onSubmit={addWebsite} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="website-name">Website Name</label>
            <input
              className="p-2 rounded bg-base-100"
              type="text"
              id="website-name"
              name="website-name"
            />
            <label htmlFor="website-url">Website URL</label>
            <input
              className="p-2 rounded bg-base-100"
              type="url"
              id="website-url"
              name="website-url"
            />
          </div>
          <button className="btn btn-secondary" type="submit">
            Add Website
          </button>
        </form>
      </div>
      <div
        id="websiteadd-script"
        className={`flex flex-col gap-4 p-4 mx-auto w-1/3  ${
          !hidden ? "hidden" : ""
        }`}>
        <textarea
          readOnly
          ref={textAreaRef}
          value={`
            <!-- SessionFlow Code -->

${websiteCode}

<!-- End SessionFlow Code -->
    
            `}
          className="mt-8 p-2 rounded bg-base-100 w-full h-96 overflow-y-scroll"></textarea>
        <div className="flex justify-between items-center mt-2 pr-[5%]">
          <input
            type="url"
            id="user-url"
            name="user-url"
            value={userURL.current || "Enter your website URL"}
            onChange={(e) => {
              userURL.current = e.target.value;
            }}
            className="p-2 rounded bg-base-100 w-2/3"
          />
        </div>
        <button className="btn btn-primary" onClick={handleCopy}>
          Copy Code
        </button>

        <div className={`text-green-500 mt-2 ${copySuccess ? "" : "hidden"}`}>
          {copySuccess}
        </div>
        <button className="btn btn-success" onClick={handleDownload}>
          Download Code
        </button>
        <div
          className={`bg-secondary/70 px-5 rounded py-2 italic ${
            error ? "" : "hidden"
          }`}>
          <b>Error Message</b>
          <br />
          {error}
        </div>
        <a href={"/dashboard/"} className="btn btn-secondary">
          Dashboard
        </a>
      </div>
    </div>
  );
}
