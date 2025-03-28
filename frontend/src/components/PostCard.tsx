import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Box,
  Tooltip,
  CardActions,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";
import { getToken } from "../utils/auth";
import { Post } from "../utils/type";

interface PostCardProps {
  post: Post;
  onLike?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
  const [likes, setLikes] = useState<number>(post.likeCount || 0);
  const [liked, setLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user has already liked the post
  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
          setLoading(false);
          return;
        }
        
        const res = await axios.get(`/api/post/hasLikedPost/${post._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLiked(res.data.hasLiked);
        console.log("Fetching post : ",post._id)
      } catch (err) {
        console.error("Error checking like status:", err);
      } finally {
        setLoading(false);
      }
    };

    checkIfLiked();
  }, [post._id]);

  // Handle like click
  const handleLike = async () => {
    if (liked || loading) return;

    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;
      
      const res = await axios.post(
        `/api/post/${post._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update the like count from the response if available, otherwise increment locally
      if (res.data?.likeCount !== undefined) {
        setLikes(res.data.likeCount);
      } else {
        setLikes(prevLikes => prevLikes + 1);
      }
      
      setLiked(true);
      
      // Notify parent component if callback is provided
      if (onLike) onLike();
    } catch (err) {
      console.error("Error liking post:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderDerivedInfo = () => {
    if (!post.derivedFrom) return null;
    return (
      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
        • Derived from @{post.derivedFrom.artistName} of Org @{post.org}
      </Typography>
    );
  };

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
        bgcolor: "#fff",
        maxWidth: "100%",
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "#1976d2", fontWeight: "bold" }}>
            {post.artistName[0]}
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            @{post.artistName}
            {renderDerivedInfo()}
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {new Date(post.createdAt).toLocaleString()}
          </Typography>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1, pb: 1 }}>
        <Typography
          variant="body2"
          color="text.primary"
          sx={{ mb: 1, whiteSpace: "pre-wrap" }}
        >
          {post.caption}
        </Typography>
        <Box
          sx={{
            mt: 1,
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid #eee",
          }}
        >
          <img
            src={post.ipfsLink}
            alt="Post"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "cover",
            }}
          />
        </Box>
      </CardContent>
      <CardActions
        sx={{
          px: 2,
          pb: 2,
          pt: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Tooltip title={liked ? "You liked this" : "Like"}>
          <span> {/* Wrapping with span to allow tooltip on disabled button */}
            <IconButton
              onClick={handleLike}
              disabled={liked || loading}
            >
              <FavoriteIcon color={liked ? "error" : "action"} />
            </IconButton>
          </span>
        </Tooltip>
        <Typography variant="body2" sx={{ ml: 0.5, color: "#555" }}>
          {likes} {likes === 1 ? "like" : "likes"}
        </Typography>
      </CardActions>
    </Card>
  );
};

export default PostCard;
