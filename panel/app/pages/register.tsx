import { useRef, useState } from "react";
import type { Route } from "../pages/+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Register - SessionFlow" }];
}

export default function () {
  const [err, setErr] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(undefined);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(form.current);
    const email = formData.get("email");
    const password = formData.get("password");
    const password2 = formData.get("password2");
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email as string)) {
      setErr("Please enter a valid email address");
      return;
    }
    if (password !== password2) {
      setErr("Passwords do not match");
      return;
    }

    fetch("http://localhost:3000/api/usercreate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, firstName, lastName }),
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = "/login";
        } else {
          return response.json().then((data) => {
            throw new Error(data.message || "Registration failed");
          });
        }
      })
      .catch((error) => {
        console.error("Registration error:", error);
        setErr(error.message);
      });
  }
  return (
    <main className="flex flex-col bg-base-300 h-screen">
      <div className="mx-auto my-auto bg-base-200 p-15 rounded-2xl">
        <div className="font-bold text-4xl mb-12 text-center">SessionFlow</div>
        <form
          className="flex flex-col gap-6"
          //@ts-ignore
          ref={form}
          onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="firstName">First Name</label>
            <input
              className="p-2 rounded bg-base-100"
              type="text"
              id="firstName"
              name="firstName"
              required
            />
            <label htmlFor="lastName">Last Name</label>
            <input
              className="p-2 rounded bg-base-100"
              type="text"
              id="lastName"
              name="lastName"
              required
            />
            <label htmlFor="email">Email</label>
            <input
              className="p-2 rounded bg-base-100"
              type="email"
              id="email"
              name="email"
              required
            />
            <label htmlFor="password">Password</label>
            <input
              className="p-2 rounded bg-base-100"
              type="password"
              id="password"
              name="password"
              required
            />
            <label htmlFor="password2">Password Confirmation</label>
            <input
              className="p-2 rounded bg-base-100"
              type="password"
              id="password2"
              name="password2"
              required
            />
          </div>
          <button
            className="btn btn-secondary"
            //@ts-ignore
            onSubmit={handleSubmit}
            type="submit">
            Register
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
