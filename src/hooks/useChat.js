import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useAppStore from "../store/useAppStore";
import { fetchChatUsers } from "../api";

const SOCKET_URL = "http://localhost:4000";

function dmRoomId(a, b) {
  return [a, b].sort().join("_");
}

/**
 * Handles everything needed for the "pick a user, then chat with them"
 * flow: connecting the socket as the logged-in user, loading the list of
 * people you can message, joining/leaving a private room per conversation,
 * and tracking unread counts per user.
 */
export default function useChat() {
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const User = useAppStore((s) => s.User);
  const currentUserId = User?.id;

  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [unreadByUser, setUnreadByUser] = useState({});

  const socketRef = useRef(null);
  const activeRoomRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn || !currentUserId) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return undefined;
    }

    const token = localStorage.getItem("confidia_user_token");
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("chat:history", ({ roomId, messages }) => {
      setMessagesByRoom((prev) => ({ ...prev, [roomId]: messages }));
    });

    socket.on("chat:message", (msg) => {
      setMessagesByRoom((prev) => ({
        ...prev,
        [msg.roomId]: [...(prev[msg.roomId] || []), msg],
      }));
      const fromOther = msg.senderId !== currentUserId;
      if (fromOther && msg.roomId !== activeRoomRef.current) {
        setUnreadByUser((prev) => ({
          ...prev,
          [msg.senderId]: (prev[msg.senderId] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isLoggedIn, currentUserId]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const list = await fetchChatUsers();
      setUsers(list);
    } catch (e) {
      console.error("loadUsers:", e);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const openConversation = useCallback(
    (otherUser) => {
      if (!currentUserId) return;
      setSelectedUser(otherUser);
      const roomId = dmRoomId(currentUserId, otherUser.id);
      activeRoomRef.current = roomId;
      setUnreadByUser((prev) => ({ ...prev, [otherUser.id]: 0 }));
      socketRef.current?.emit("chat:join-dm", { otherUserId: otherUser.id });
    },
    [currentUserId],
  );

  const closeConversation = useCallback(() => {
    setSelectedUser(null);
    activeRoomRef.current = null;
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const clean = (text || "").trim();
      if (!clean || !selectedUser || !socketRef.current) return;
      socketRef.current.emit("chat:message", {
        otherUserId: selectedUser.id,
        text: clean,
      });
    },
    [selectedUser],
  );

  const roomId = selectedUser && currentUserId ? dmRoomId(currentUserId, selectedUser.id) : null;
  const messages = roomId ? messagesByRoom[roomId] || [] : [];
  const totalUnread = Object.values(unreadByUser).reduce((a, b) => a + b, 0);

  return {
    connected,
    users,
    usersLoading,
    loadUsers,
    selectedUser,
    openConversation,
    closeConversation,
    messages,
    sendMessage,
    unreadByUser,
    totalUnread,
    currentUserId,
  };
}
