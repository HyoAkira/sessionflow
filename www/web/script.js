var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// main.ts
var fundementalEvents = class {
  constructor() {
    __publicField(this, "userData");
  }
  trackClick() {
    document.addEventListener("click", (event) => {
      const { clientX: x, clientY: y } = event;
      const time = Date.now();
      this.userData.clicks.push({ x, y, time });
    });
    return this;
  }
  trackScroll() {
    document.addEventListener("scroll", () => {
      const { scrollX: x, scrollY: y } = window;
      const time = Date.now();
      this.userData.scrolls.push({ x, y, time });
    });
    return this;
  }
  trackFocusLoss() {
    window.addEventListener("blur", () => {
      this.userData.focusLossCount++;
    });
    return this;
  }
  getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) {
      this.userData.deviceType = "mobile";
    } else if (width < 1024) {
      this.userData.deviceType = "tablet";
    } else {
      this.userData.deviceType = "desktop";
    }
    return this;
  }
  trackSessionDuration() {
    const startTime = this.userData.sessionStart;
    setInterval(() => {
      const currentTime = Date.now();
      this.userData.sessionDuration = currentTime - startTime;
    }, 1e3);
    return this;
  }
};
var Tracker = class extends fundementalEvents {
  constructor(url) {
    super();
    __publicField(this, "userData");
    __publicField(this, "serverConf", {
      url: ""
    });
    const localData = JSON.parse(
      localStorage.getItem("userData") || "{}"
    );
    this.serverConf.url = url || "http://localhost:3000/api/";
    this.userData = {
      sessionID: localData.sessionID || crypto.randomUUID(),
      clicks: localData.clicks || [],
      scrolls: localData.scrolls || [],
      focusLossCount: localData.focusLossCount || 0,
      sessionStart: localData.sessionStart || Date.now(),
      sessionDuration: localData.sessionDuration || 0,
      deviceType: localData.deviceType || void 0
    };
  }
  //   workerSession() {
  //     const worker = new Worker(new URL("./worker.ts", import.meta.url), {
  //       type: "module",
  //     });
  //     worker.postMessage({ type: "start", startTime: Date.now() });
  //     worker.onmessage = (e) => {
  //       if (e.data.type === "duration") {
  //         const seconds = Math.floor(e.data.data / 1000);
  //         this.userData.sessionDuration = seconds;
  //       }
  //     };
  //     // sayfa kapanırken worker'ı durdur
  //     window.addEventListener("beforeunload", () => {
  //       worker.postMessage({ type: "stop" });
  //       worker.terminate();
  //     });
  //     return this;
  //   }
  resetSession() {
    window.addEventListener("load", () => {
      const localSession = localStorage.getItem("userData");
      if (localSession) {
        const parsedSession = JSON.parse(localSession);
        if (parsedSession.sessionDuration > 1e3 * 60 * 60) {
          localStorage.removeItem("userData");
        }
      }
    });
    return this;
  }
  fastStart() {
    this.resetSession();
    this.trackScroll();
    this.trackClick();
    this.trackSessionDuration();
    this.trackFocusLoss();
    this.getDeviceType();
    return this;
  }
  startTracking() {
    this.saveToLocalStorage();
    setInterval(() => {
      console.log("Tracking user data:", this.userData);
      this.saveToServer();
    }, 1500);
    return this;
  }
  saveToLocalStorage() {
    window.addEventListener("beforeunload", () => {
      localStorage.setItem("userData", JSON.stringify(this.userData));
    });
  }
  saveToServer() {
    fetch(`${this.serverConf.url}userclientdata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ clientData: this.userData })
    }).then((response) => response.json()).then((data) => {
      console.log("Server response:", data);
    }).catch((error) => {
      console.error("Error saving data to server:", error);
    });
    return this;
  }
};
var tracker = new Tracker().fastStart().startTracking();
//# sourceMappingURL=bundle.js.map
