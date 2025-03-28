import { useState } from "react";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Grid, 
  Container, 
  useTheme,
  InputAdornment,
  IconButton
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setUser } from "../utils/auth";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError(""); // Reset error message before submitting
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;
  
      const res = await axios.post(endpoint, body);
      console.log(res.data.user);
      const username = res.data.user.username; 

      setUser(res.data.user);
      localStorage.setItem("username", username);
     
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/home");
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
      console.error("Auth error:", err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, #ffffff 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative elements */}
      <Box 
        sx={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,111,97,0.1) 0%, rgba(255,111,97,0) 70%)",
          top: "-200px",
          right: "-200px",
        }}
      />
      <Box 
        sx={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(97,218,251,0.1) 0%, rgba(97,218,251,0) 70%)",
          bottom: "-150px",
          left: "-150px",
        }}
      />
      
      <Container maxWidth="xs">
        <Paper 
          elevation={0} 
          sx={{ 
            padding: 4, 
            width: "100%", 
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0px 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            align="center" 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.primary.main,
              mb: 3
            }}
          >
            {isLogin ? "Welcome Back" : "Join InstaBlock"}
          </Typography>
          
          <form onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <TextField
                label="Username"
                name="username"
                fullWidth
                margin="normal"
                value={formData.username}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <TextField
              label="Email"
              name="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && (
              <Typography variant="body2" color="error" align="center" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <Button 
              variant="contained" 
              fullWidth 
              sx={{ 
                mb: 2, 
                py: 1.5,
                borderRadius: 2,
                boxShadow: "0px 4px 10px rgba(255, 111, 97, 0.3)",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0px 6px 15px rgba(255, 111, 97, 0.4)",
                }
              }} 
              onClick={handleSubmit}
            >
              {isLogin ? "Login" : "Register"}
            </Button>
            <Grid container justifyContent="center">
              <Button 
                onClick={() => setIsLogin(!isLogin)} 
                sx={{ 
                  textTransform: "none", 
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  "&:hover": {
                    background: "transparent",
                    opacity: 0.8
                  }
                }}
              >
                {isLogin ? "New user? Sign up" : "Already have an account? Login"}
              </Button>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthPage;
