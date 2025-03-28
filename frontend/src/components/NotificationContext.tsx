// ✅ NotificationContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { Notification } from "../utils/type";
import { io, Socket } from "socket.io-client";
import { getUser } from "../utils/auth";
import axios from "axios";

const defaultContextValue = {
  notifications: [] as Notification[],
  unreadCount: 0,
  markAsRead: () => {},
};

const NotificationContext = createContext(defaultContextValue);

export const NotificationProvider = ({ children }: any) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  const user = getUser();

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        if (!user?.id) return;
        const res = await axios.get(`/api/notifications/${user.id}`);
        setNotifications(res.data);
        const unread = res.data.filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    if (!user?.id) return;
    fetchInitialNotifications();

    const newSocket = io("http://localhost:4001", { transports: ["websocket"] });

    newSocket.on("connect", () => {
      console.log("Socket connected", newSocket.id);
      newSocket.emit("register", user.id);
    });

    newSocket.on("notification", (message: { message: string }) => {
      const newNotification = {
        message: message.message,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("userDisconnect");
      newSocket.disconnect();
    };
  }, [user?.id]);

  const markAsRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);