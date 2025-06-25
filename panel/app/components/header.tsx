import { Link } from "react-router";
export default function () {
  return (
    <>
      <header className="bg-base-200">
        <nav className="flex justify-between py-4 px-[5%] items-center">
          <div className="font-bold text-4xl">SessionFlow</div>
          <ol className="flex gap-6 p-4 font-semibold h-12 items-center">
            <li className="navbarElement">
              <Link to="/about">About</Link>
            </li>
            <li className="navbarElement">
              <Link to="/docs">Docs</Link>
            </li>
            <li className="navbarElement">
              <Link to="/demo">Demo</Link>
            </li>
          </ol>
          <div className="flex gap-4">
            <Link className="btn btn-primary" to={"/login"}>
              Login
            </Link>
            <Link className="btn btn-neutral" to={"/register"}>
              Register
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
