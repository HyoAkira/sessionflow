import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/home.tsx"),
  route("login", "pages/login.tsx"),
  route("about", "pages/about.tsx"),
  route("register", "pages/register.tsx"),
  {
    path: "/dashboard",
    file: "layout/layout.tsx",
    children: [
      index("pages/dashboard/dashboard.tsx"),
      route("visitreports", "pages/dashboard/visitreports.tsx"),
      route("settings", "pages/dashboard/settings.tsx"),
    ],
  },
  route("/dashboard/websiteadd", "pages/dashboard/websiteadd.tsx"),
] satisfies RouteConfig;
