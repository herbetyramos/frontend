import { io } from "socket.io-client";

const socketUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

export const socket = io(socketUrl, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  withCredentials: true,
});

