import Tracker from "./tracker";

//@ts-ignore
const url = API_URL;
//@ts-ignore
const siteID = SITE_ID;
const tracker = new Tracker(url, siteID).fastStart().startTracking();
