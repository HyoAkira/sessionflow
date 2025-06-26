import Tracker from "./tracker";

//@ts-ignore
const url = API_URL;
const tracker = new Tracker(url).fastStart().startTracking();
