import { useRef, useState, type FormEvent } from "react";

export default function () {
  const [hidden, setHidden] = useState(true);
  const [error, setError] = useState("");
  const userURL = useRef<string>("");
  //@ts-ignore
  function addWebsite(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const websiteName = formData.get("website-name");
    const websiteUrl = formData.get("website-url");
    setHidden(!hidden);
    console.log({ websiteName, websiteUrl });
  }

  //@ts-ignore
  function testScript(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    console.log(userURL.current);
    setError("Sonra eklenecek.");
  }

  return (
    <div
      id="website-add"
      className="h-screen bg-base-300 flex flex-col gap-4 p-4">
      <div
        id="header"
        className="mx-auto my-4 text-4xl font-bold bg-base-200 w-full text-center py-2">
        <div>CookieChef</div>
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
          defaultValue={`
            <!-- CookieChef Code -->
<script type="text/javascript">

  (function() {
    var u="//{$cookieChefURL}/";

    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.src=u+'cookiechef.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
<!-- End CookieChef Code -->
    
            `}
          className="mt-8 p-2 rounded bg-base-100 w-full h-96 overflow-y-scroll"></textarea>
        <div className="flex justify-between items-center mt-2 pr-[5%]">
          <input
            type="url"
            id="user-url"
            name="user-url"
            placeholder="Enter a URL"
            onChange={(e) => {
              userURL.current = e.target.value;
            }}
            className="p-2 rounded bg-base-100 w-2/3"
          />
          <button
            className="btn btn-secondary bg-secondary/70"
            onClick={testScript}
            type="submit">
            Test Script
          </button>
        </div>
        <div
          className={`bg-secondary/70 px-5 rounded py-2 italic ${
            error ? "" : "hidden"
          }`}>
          <b>Error Message</b>
          <br />
          {error}
        </div>
      </div>
    </div>
  );
}
