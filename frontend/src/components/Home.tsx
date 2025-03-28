import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Stack,
  Paper,
  useTheme,
} from "@mui/material";
import Navbar from "../components/Navbar";
import UploadSection from "../components/UploadSection";
import PostCard from "../components/PostCard";
import { getToken } from "../utils/auth";
import { Post } from "../utils/type";

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const theme = useTheme();

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/api/posts", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      
      setPosts(res.data.map((post: any) => ({ ...post })));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching posts", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(); // Fetch initially
    
    const intervalId = setInterval(() => {
        if (!document.hidden) fetchPosts(); // Only when tab is active
      }, 6000);

    // Handle tab visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPosts(); // Fetch immediately when tab becomes visible
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, #ffffff 100%)`,
          flexGrow: 1,
          py: 4,
          position: "relative",
          overflowY: "auto", // Enable vertical scrolling
          overflowX: "hidden", // Prevent horizontal scrolling
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{
            position: "fixed",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,111,97,0.1) 0%, rgba(255,111,97,0) 70%)",
            top: "10%",
            right: "-150px",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <Box 
          sx={{
            position: "fixed",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(97,218,251,0.1) 0%, rgba(97,218,251,0) 70%)",
            bottom: "10%",
            left: "-100px",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <Container 
          maxWidth="md" 
          sx={{ 
            position: "relative", 
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              mb: 4,
              bgcolor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0px 8px 20px rgba(0,0,0,0.06)",
              width: "100%",
              maxWidth: 500,
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <UploadSection onUpload={fetchPosts} />
          </Paper>

          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 700,
              color: theme.palette.primary.main,
              textAlign: "center",
              position: "relative",
              display: "inline-block",
              "&:after": {
                content: '""',
                position: "absolute",
                width: "40%",
                height: "3px",
                background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
                bottom: "-8px",
                left: "30%",
              }
            }}
          >
            Recent Posts
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" sx={{ my: 6 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <Stack spacing={3} alignItems="center" sx={{ width: "100%" }}>
              {posts.map((post) => (
                <Box 
                  key={post._id} 
                  sx={{ 
                    width: "100%", 
                    maxWidth: 500,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.02)",
                    }
                  }}
                >
                  <PostCard key={post._id + post.likeCount} post={post} onLike={fetchPosts} />
                </Box>
              ))}
            </Stack>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
