import { useRef } from "react";
import type { Route } from "../pages/+types/home";
import Header from "~/components/header";

export function meta({}: Route.MetaArgs) {
  return [{ title: "About - SessionFlow" }];
}

export default function () {
  return (
    <>
      <main className="flex flex-col h-screen">
        <Header></Header>
        <div className="p-5">
          <h1 className="text-3xl font-bold">About SessionFlow</h1>
          <p className="p-6">
            SessionFlow is a powerful session tracking and analytics tool
            designed to help you understand user behavior on your website. With
            real-time tracking capabilities and intuitive visualizations,
            SessionFlow makes it easy to analyze user interactions and improve
            your website's user experience.
          </p>
          <h2 className="text-2xl font-semibold">Features</h2>
          <ul className="list-disc pl-6">
            <li>
              <strong>Real-time Session Tracking:</strong> Monitor user
              interactions as they happen.
            </li>
            <li>
              <strong>Session Replay:</strong> Watch recorded sessions to see
              exactly how users navigate your site.
            </li>
            <li>
              <strong>Heat contents:</strong> Visualize user's engagement with
              website content.
            </li>
            <li>
              <strong>Custom Events:</strong> Track specific user actions and
              events.
            </li>
          </ul>
          <h2 className="text-2xl font-semibold mt-4">Getting Started</h2>
          <p className="p-6">
            To get started with SessionFlow, simply create an account and
            integrate the SessionFlow tracking code into your website. Once set
            up, you can start tracking user sessions and gaining valuable
            insights into user behavior.
          </p>
          <h2 className="text-2xl font-semibold mt-4">Support</h2>
          <p className="p-6">
            If you have any questions or need assistance, please visit mail to:
            support@sessionflow.com .
          </p>
        </div>
      </main>
    </>
  );
}
