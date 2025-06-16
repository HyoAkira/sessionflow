// live user count
// visit report

import Tracker from "./tracker";

const tracker = new Tracker("http://localhost:3000")
  .fastStart()
  .startTracking();
