import Session from "../schemas/schema.sessions";

export default class DBService {
  static createSession() {
    Session.create({
      sessionID: "1",
      clicks: [],
      scrolls: [],
      focusLossCount: 0,
      sessionStart: Date.now(),
      sessionDuration: 0,
      deviceType: "desktop", // Default value, can be updated later
    })
      .then((session) => {
        console.log("Session created:", session);
      })
      .catch((error) => {
        console.error("Error creating session:", error);
      });
  }
}
