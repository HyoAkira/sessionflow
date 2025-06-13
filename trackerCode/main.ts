// live user count
// visit report
type UserData = {
  sessionID: string;
  clicks: { x: number; y: number; time: number }[];
  scrolls: { y: number; x: number; time: number }[];
  focusLossCount: number;
  sessionStart: number;
  sessionDuration: number;
  deviceType: "mobile" | "desktop" | "tablet";
};

class fundementalEvents {
  protected userData: UserData;

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
    }, 1000);
    return this;
  }
}

class Tracker extends fundementalEvents {
  protected userData: UserData;
  private serverConf = {
    url: "",
  };
  constructor(url?) {
    super();
    const localData: UserData = JSON.parse(
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
      deviceType: localData.deviceType || undefined,
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
        const parsedSession: UserData = JSON.parse(localSession);

        if (parsedSession.sessionDuration > 1000 * 60 * 60) {
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clientData: this.userData }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Server response:", data);
      })
      .catch((error) => {
        console.error("Error saving data to server:", error);
      });
    return this;
  }
}

const tracker = new Tracker().fastStart().startTracking();
