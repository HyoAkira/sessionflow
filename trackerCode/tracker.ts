import io from "socket.io-client";
import FormService from "./formService";

type UserData = {
  sessionID: string;
  clicks: { x: number; y: number; time: number }[];
  scrolls: { y: number; x: number; time: number }[];
  focusLossCount: number;
  sessionStart: number;
  sessionDuration: number;
  deviceType: "mobile" | "desktop" | "tablet" | undefined;
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
  private socket = io("http://localhost:3000");
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
    this.socketConnectionHandler();
    this.socket.emit("getSession", this.userData.sessionID, (cb) => {
      if (cb.error) {
        console.error("Error fetching session data:", cb.message);
      } else {
        console.log("Session data fetched successfully:", cb.data);
        this.userData = cb.data;
      }
    });
  }
  socketConnectionHandler() {
    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
    });
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

        if (parsedSession.sessionDuration > 3600000) {
          localStorage.removeItem("userData");
          this.userData = {
            sessionID: crypto.randomUUID(),
            clicks: [],
            scrolls: [],
            focusLossCount: 0,
            sessionStart: Date.now(),
            sessionDuration: 0,
            deviceType: undefined,
          };
        }
      }
    });
    return this;
  }

  fastStart() {
    this.resetSession();
    // this.trackScroll();
    this.trackClick();
    this.trackSessionDuration();
    this.trackFocusLoss();
    this.getDeviceType();
    this.setPageEvents();
    this.setFormEvents();
    this.saveFormEventsToServer();
    return this;
  }
  startTracking() {
    this.saveToLocalStorage();
    setInterval(() => {
      // console.log("Tracking user data:", this.userData);
      this.saveToServer();
      this.savePageDataToServer();
    }, 1500);

    return this;
  }

  saveToLocalStorage() {
    window.addEventListener("beforeunload", () => {
      localStorage.setItem("userData", JSON.stringify(this.userData));
    });
  }

  saveToServer() {
    //payload büyümesini engellemek için socket ile gondermeye gecirdim
    const requestPromise = new Promise((resolve, reject) => {
      this.socket.emit("userData", this.userData, (cb) => {
        if (cb.error) {
          reject(cb.message);
        } else {
          resolve(cb.message);
        }
      });
    });
    requestPromise
      .then((data) => {
        console.log("Server response:", data);
      })
      .catch((error) => {
        console.error("Error saving data to server:", error);
      });
    // fetch(`${this.serverConf.url}userclientdata`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ clientData: this.userData }),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log("Server response:", data);
    //   })
    //   .catch((error) => {
    //     console.error("Error saving data to server:", error);
    //   });
  }

  setPageEvents() {
    PageTrackerService.setPageEvents();
    return this;
  }
  savePageDataToServer() {
    const pageData = PageTrackerService.PageData;
    pageData.sessionID = this.userData.sessionID;

    if (!pageData) {
      return;
    }
    this.socket.emit("pageData", pageData, (cb) => {
      if (cb.error) {
        console.error("Error saving page data to server:", cb.message);
      } else {
        console.log("Page data saved successfully:", cb.message);
      }
    });
  }

  setFormEvents() {
    FormService.listenFormInputs();

    return this;
  }
  saveFormEventsToServer() {
    FormService.FormData.sessionID = this.userData.sessionID;
    FormService.FormData.pageID = PageTrackerService.pageID;
    const formSave = () => {
      // bos form ise atma
      if (
        !FormService.FormData.comment &&
        !FormService.FormData.message &&
        !FormService.FormData.gender &&
        !FormService.FormData.min_price &&
        !FormService.FormData.max_price
      )
        return;
      this.socket.emit("formData", FormService.FormData, (cb) => {
        if (cb.error) {
          console.error("Error saving form data to server:", cb.message);
        } else {
          console.log("Form data saved successfully:", cb.message);

          console.log(
            "Form data:",
            JSON.stringify(FormService.FormData, null, 2)
          );
        }
      });
    };

    setInterval(formSave, 3000);
    window.addEventListener("beforeunload", formSave, false);

    return this;
  }
}
export default Tracker;

type IPage = {
  title: string;
  url: string;
  date: number;
  contents: string[];
  records: { content; category; visibleDuration }[];
  categories: string[];
  pageDuration: number;
};

class PageTrackerService {
  public static PageData;
  static pageID = crypto.randomUUID();
  private PageTrackerService() {}
  private static instance: PageTrackerService;
  public static getInstance(): PageTrackerService {
    if (!PageTrackerService.instance) {
      PageTrackerService.instance = new PageTrackerService();
    }
    return PageTrackerService.instance;
  }

  static setPageEvents() {
    const pageTimer = Date.now();
    const page: IPage = {
      title: document.title,
      url: window.location.href,
      date: Date.now(),
      contents: [],
      categories: [],
      pageDuration: 0,
      records: [],
    };

    const records = new Map<
      HTMLElement,
      {
        startTime: number | null;
        totalVisibleDuration: number;
        content: string | null;
        category: string | null;
      }
    >();
    const cb = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        const content = el.getAttribute("data-ckcontent") || null;
        const category = el.getAttribute("data-ckcategory") || null;
        if (!records.has(el)) {
          records.set(el, {
            startTime: null,
            totalVisibleDuration: 0,
            content,
            category,
          });
        }
        const record = records.get(el)!;
        if (entry.isIntersecting) {
          // Başlangıç zamanını kaydet

          if (record.startTime === null) {
            record.startTime = Date.now();
          }
        }
        if (!entry.isIntersecting) {
          if (!record.startTime) return;
          let endTime = Date.now();
          record.totalVisibleDuration += endTime - record.startTime;
          console.log(
            "Visible",
            record.totalVisibleDuration,
            "startTime",
            record.startTime,
            "endTime",
            endTime
          );
          record.startTime = null;
        }
      });
    };
    const observer = new IntersectionObserver(cb, {
      threshold: 0.3,
    });

    // ckcontent ve ckcategory içeren tüm elementler
    const targetElements = document.querySelectorAll(
      "[data-ckcontent],[data-ckcategory]"
    );
    targetElements.forEach((element) => {
      observer.observe(element);
    });
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              if (
                node.hasAttribute("data-ckcontent") ||
                node.hasAttribute("data-ckcategory")
              ) {
                observer.observe(node);
              }
            }
          });
        }
      });
    });
    mutationObserver.observe(document.body, {
      attributes: true, // attribute değişimi
      characterData: true, // metin değişimi
      childList: true, // ekleme/silme
      subtree: true, // tüm alt elementleri kapsar
    });

    const finalize = () => {
      const currentTime = Date.now();
      page.pageDuration = currentTime - pageTimer;
      records.forEach((record, element) => {
        if (record.totalVisibleDuration > 0) {
          if (record.category && !page.categories.includes(record.category)) {
            page.categories.push(record.category);
          }
          if (record.content && !page.contents.includes(record.content)) {
            page.contents.push(record.content);
          }
          page.records = Array.from(records, ([el, rec]) => {
            return {
              content: rec.content,
              category: rec.category,
              visibleDuration: rec.totalVisibleDuration,
              startTime: rec.startTime,
            };
          });
        }
      });

      PageTrackerService.PageData = page;
      PageTrackerService.PageData.pageID = PageTrackerService.pageID;
    };

    setInterval(() => {
      finalize();
    }, 1000);

    window.addEventListener("beforeunload", () => {
      finalize();
    });
  }
}
