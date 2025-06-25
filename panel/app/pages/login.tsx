import { useRef, useState } from "react";
import type { Route } from "../pages/+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login - SessionFlow" }];
}

export default function () {
  const [err, setErr] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(undefined);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(form.current);
    const email = formData.get("email");
    const password = formData.get("password");

    fetch("http://localhost:3000/api/userlogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json().then((data) => {
            localStorage.setItem("token", data.data.token);
            window.location.href = "/dashboard";
          });
        } else {
          return response.json().then((data) => {
            throw new Error(data.message || "Login failed");
          });
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        setErr(error.message);
      });
  }

  return (
    <main className="flex flex-col bg-base-300 h-screen">
      <div className="mx-auto my-auto bg-base-200 p-15 rounded-2xl">
        <div className="font-bold text-4xl mb-12 text-center">SessionFlow</div>

        <form
          //@ts-ignore
          ref={form}
          className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <input
              className="p-2 rounded bg-base-100"
              type="email"
              id="email"
              name="email"
            />
            <label htmlFor="password">Password</label>
            <input
              className="p-2 rounded bg-base-100"
              type="password"
              id="password"
              name="password"
            />
          </div>
          <button
            className="btn btn-secondary"
            //@ts-ignore
            onClick={handleSubmit}
            type="submit">
            Login
          </button>
        </form>
        <div
          className={`text-center mt-4 bg-primary/70 p-2 rounded italic ${
            err ? "" : "hidden"
          }`}>
          {err && "Error: " + err}
        </div>
      </div>
    </main>
  );
}
