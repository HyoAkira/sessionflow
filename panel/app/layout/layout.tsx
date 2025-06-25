import { Link, Outlet } from "react-router";

// export default function () {
//   return <Outlet />;
// }
export default function () {
  return (
    <main className="flex flex-row bg-base-300 h-screen w-screen">
      <aside className="w-1/6 bg-base-200 flex flex-col gap-4 h-full">
        <div className="font-bold text-4xl mb-12 text-center p-4">
          SessionFlow
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
          <div>John Doe.</div>
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
