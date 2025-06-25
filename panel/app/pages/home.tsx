import { Link } from "react-router";
import type { Route } from "../pages/+types/home";
import Header from "~/components/header";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SessionFlow" },
    { name: "description", content: "SessionFlow!!" },
  ];
}

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <Header></Header>

      <div id="hero" className="bg-base-100 w-full flex-1">
        <div className="hero-content flex-col lg:flex-row-reverse mx-auto">
          <img
            src="/images/sessionflow.jpg"
            className="max-w-xl pt-5 rounded-lg"
          />
          <div>
            <h1 className="text-5xl font-bold">SessionFlow!</h1>
            <p className="py-6">
              SessionFlow is a website analyze platform that allows users to
              analyze their customers' happiness. It provides detailed reports
              and insights into user behavior, helping businesses improve their
              services and enhance customer satisfaction.
            </p>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
      <footer className="bg-base-200  px-[2%] py-2 text-neutral-content">
        <p>
          SessionFlow.
          <br />
          All rights reserved.
        </p>
      </footer>
    </main>
  );
}
