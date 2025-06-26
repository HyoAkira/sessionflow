import { useEffect, useState } from "react";
import { Link, Navigate, Outlet } from "react-router";
import userStore from "~/store";
import type { TUser } from "../../../restServer/schemas/user.schema";

// export default function () {
//   return <Outlet />;
// }
export default function () {
  const token = userStore((s) => s.token);
  const setToken = userStore((s) => s.setToken);
  const [user, setUser] = useState<TUser | null>(null);
  const [redirect, setRedirect] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
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
  if (user === null) {
    return <div>Loading...</div>;
  }
  return (
    <main className="flex flex-row bg-base-300 h-screen w-screen">
      <aside className="w-1/6 bg-base-200 flex flex-col gap-4 h-full">
        <div className="font-bold text-4xl mb-12 text-center p-4">
          <Link to="/dashboard/" className="navbarElement">
            <span className="hidden lg:inline">SessionFlow</span>
            <span className="lg:hidden">SF</span>
          </Link>
        </div>
        <div className="flex flex-col gap-2 pl-4 font-semibold text-xl flex-grow">
          <Link to="/dashboard/" className="navbarElement">
            Home
          </Link>
          <Link to="/dashboard/reports" className="navbarElement">
            Reports
          </Link>
          <Link to="/dashboard/detailedreports" className="navbarElement">
            Detailed Reports
          </Link>
          <Link to="/dashboard/visitreports" className="navbarElement">
            Visit Reports
          </Link>
          <Link to="/dashboard/customerreports" className="navbarElement">
            Customer Reports
          </Link>
        </div>
        <div className="bg-base-100 min-h-12 p-4 flex justify-between items-center">
          <div>
            {user.firstName} {user.lastName}
          </div>
          <details className="dropdown dropdown-top">
            <summary className="btn m-1">
              <img src="/images/gear.svg" width={24}></img>
            </summary>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 w-34 rounded-box z-1 p-2 shadow-sm">
              <li>
                <Link to="/dashboard/">Settings</Link>
              </li>
              <li>
                <Link to="/dashboard/">Logout</Link>
              </li>
            </ul>
          </details>
        </div>
      </aside>
      <div className="flex-1">
        <Outlet />
      </div>
    </main>
  );
}
