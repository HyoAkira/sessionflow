// live user count
// visit report

import Tracker from "./tracker";
import io from "socket.io-client";
const tracker = new Tracker().fastStart().startTracking();
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
});
