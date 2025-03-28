import React from "react";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Button,
  Box,
  IconButton,
  useTheme,
} from "@mui/material";
import { getUserName, logout } from "../utils/auth";
import Notification from "./Notification";

const Navbar = () => {
  const username = getUserName();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        {/* Left Side - Logo */}
        <Typography
          variant="h6"
          sx={{ 
            fontWeight: "bold", 
            color: theme.palette.primary.main, 
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            "& span": {
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, #FFA07A)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }
          }}
          onClick={() => navigate("/home")}
        >
          <span>InstaBlock</span>
        </Typography>

        {/* Center - Username */}
        {username && (
          <Box
            display="flex"
            alignItems="center"
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main, 
                color: "#fff", 
                mr: 1,
                boxShadow: "0 2px 10px rgba(255, 111, 97, 0.3)",
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography
              variant="subtitle1"
              sx={{ 
                color: "#333", 
                fontWeight: 600,
              }}
            >
              {username}
            </Typography>
          </Box>
        )}

        {/* Right Side - Icons & Logout */}
        {username && (
          <Box display="flex" alignItems="center">
            <IconButton 
              onClick={() => navigate("/home")} 
              sx={{ 
                mr: 2,
                color: theme.palette.primary.main,
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.1)",
                  background: "rgba(255, 111, 97, 0.1)",
                }
              }}
            >
              <HomeIcon />
            </IconButton>

            <Notification />

            <Button
              variant="outlined"
              color="primary"
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                borderRadius: 2,
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: "rgba(255, 111, 97, 0.1)",
                  transform: "translateY(-2px)",
                },
              }}
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
