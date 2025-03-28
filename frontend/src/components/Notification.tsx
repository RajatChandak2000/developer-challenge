// ✅ Notification.tsx
import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  IconButton,
  Badge,
  Box,
  Divider,
} from "@mui/material";
import { useNotifications } from "./NotificationContext";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

const Notification = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
  } = useNotifications();

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
    markAsRead();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton onClick={handleClickOpen} sx={{ position: "relative" }}>
        <Badge
          badgeContent={unreadCount}
          color="error"
          overlap="circular"
        >
          <NotificationsNoneIcon style={{ fontSize: 26 }} />
        </Badge>
      </IconButton>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Notifications</DialogTitle>
        <Divider />
        <DialogContent>
          {notifications.length === 0 ? (
            <Typography>No new notifications</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {notifications.map((notif, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: notif.read ? "#f5f5f5" : "#fff3e0",
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid #eee",
                  }}
                >
                  <Typography variant="body2">{notif.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notif.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Notification;