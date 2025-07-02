import { useEffect, useState } from "react";
import userStore from "~/store";
import type { TUser } from "../../../../restServer/schemas/user.schema";

export default function () {
  const setTheme = userStore((state) => state.setSiteTheme);
  const [user, setUser] = useState<TUser | null>(null);
  const token = userStore((s) => s.token);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!token) {
      console.error("No token found, redirecting to login.");
    }
    if (token) {
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
          } else {
            setUser(data.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch user data:", err);
        });
    }
    return () => {};
  }, [token]);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //@ts-ignore
    setTheme(e.target.value);
  };

  if (user === null) {
    return <div>Loading...</div>;
  }

  function handleUpdateUser(e) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("e-mail");
    const firstName = formData.get("first-name");
    const lastName = formData.get("last-name");
    const password = formData.get("password");
    const data = {
      email: email ? email : user?.email,
      firstName: firstName ? firstName : user?.firstName,
      lastName: lastName ? lastName : user?.lastName,
      password: password ? password : user?.password,
    };
    const body = {
      ...user,
      ...data,
    };
    fetch("http://localhost:3000/api/userupdate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error(body);
          console.error("Error updating user data:", data.message);
        } else {
          setUser(data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to update user data:", err);
      });
  }

  function handleDeleteUser() {
    fetch("http://localhost:3000/api/userdelete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Error deleting user:", data.message);
        } else {
          // Optionally, log out or redirect user after deletion
          alert("Account deleted successfully.");
          window.location.href = "/login";
        }
      })
      .catch((err) => {
        console.error("Failed to delete user:", err);
      });
  }

  return (
    <>
      <div
        id="detailed-reports"
        className="w-full flex flex-wrap flex-col gap-4 h-full bg-base-300 p-4">
        <div className="flex gap-2 items-center justify-end">
          <div className="text-base-content font-semibold justify-self-end">
            Theme
          </div>
          <select
            className="select md:w-min"
            data-choose-theme
            onChange={handleThemeChange}>
            <option value="autumn">Autumn</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="dim">Dim</option>
            <option value="business">Business</option>
            <option value="pastel">Pastel</option>
            <option value="garden">Garden</option>
          </select>
        </div>
        <form
          onSubmit={handleUpdateUser}
          className="flex flex-col gap-2 justify-center items-center">
          <span className="font-semibold text-2xl text-base-content">
            Update User Info
          </span>
          <Field content="E-mail" type="text" placeholder={user.email} />
          <Field
            content="First Name"
            type="text"
            placeholder={user.firstName}
          />
          <Field content="Last Name" type="text" placeholder={user.lastName} />
          <Field content="Password" type="password" placeholder="*******" />
          <div className="flex justify-center gap-2">
            <button className="btn btn-info " type="submit">
              Update Account
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setShowDeleteConfirm(true)}>
              Delete Account
            </button>
          </div>
        </form>
        {showDeleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-base-100 p-6 rounded shadow-lg flex flex-col gap-4">
              <div className="font-bold text-lg text-error">
                Are you sure you want to delete your account?
              </div>
              <div className="text-base-content">
                This action cannot be undone. All your data will be permanently
                deleted.
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  className="btn btn-error"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    handleDeleteUser();
                  }}>
                  Yes, Delete
                </button>
                <button
                  className="btn"
                  onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Field({
  content,
  type,
  placeholder,
}: {
  content: string;
  type: string;
  placeholder: string;
}) {
  return (
    <label className=" pl-2 w-md">
      <div className="font-semibold text-base-content ">{content}</div>
      <input
        name={content.toLowerCase().replace(" ", "-")}
        type={type}
        className="input input-bordered w-full"
        placeholder={placeholder}
      />
    </label>
  );
}
