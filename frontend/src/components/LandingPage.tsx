// src/components/LandingPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, Paper, Link } from "@mui/material";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace this with real login logic
    navigate("/home");
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Welcome to FaceGram
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField label="Email" fullWidth required margin="normal" />
          <TextField label="Password" type="password" fullWidth required margin="normal" />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Log In
          </Button>
        </form>
        <Typography variant="body2" align="center" mt={2}>
          New here?{" "}
          <Link href="/signup" underline="hover">
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LandingPage;
