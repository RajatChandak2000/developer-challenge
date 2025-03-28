import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AuthPage from "./components/ AuthPage";
import { isAuthenticated } from "./utils/auth";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { NotificationProvider } from "./components/NotificationContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6A5ACD", // Rich purple-blue
    },
    secondary: {
      main: "#4F46E5", // Vibrant indigo
    },
    background: {
      default: "#F4F6FB", // Soft background for better contrast
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
      color: "#4F46E5", // Indigo highlight
    },
    h5: {
      fontWeight: 600,
      color: "#6A5ACD",
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#4F46E5",
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#E0E7FF", // Lighter blue track
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#4F46E5", // Deep indigo
            borderRadius: "6px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#4338CA", // Slightly darker indigo
          },
        },
      },
    },
  },
});

const App = () => {
  return (
    <NotificationProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/home" element={isAuthenticated() ? <Home /> : <AuthPage />} />
          </Routes>
        </div>
      </ThemeProvider>
    </NotificationProvider>
  );
};

export default App;
