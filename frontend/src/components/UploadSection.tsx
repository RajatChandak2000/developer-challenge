import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  useTheme,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import axios from "axios";
import { getToken } from "../utils/auth";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import TitleIcon from "@mui/icons-material/Title";
import CopyrightIcon from "@mui/icons-material/Copyright";

const UploadSection = ({ onUpload }: { onUpload: () => void }) => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [requireRoyalty, setRequireRoyalty] = useState(false);
  const [royaltyModalOpen, setRoyaltyModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const theme = useTheme();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!caption || !image) {
      setSnackbarMessage("Please fill out all fields");
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", image);
    formData.append("requireRoyalty", String(requireRoyalty));

    try {
      const response = await axios.post("/api/post", formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.data.requiresRoyalty) {
        setPendingFormData(formData);
        setRoyaltyModalOpen(true);
      } else {
        onUpload();
        setSnackbarMessage("Image uploaded successfully!");
        setSnackbarOpen(true);
        setCaption("");
        setImage(null);
        setImagePreview(null);
        setRequireRoyalty(false);
      }
    } catch (err: any) {
      setSnackbarMessage("Upload failed.");
      setSnackbarOpen(true);
      console.error("Upload error:", err);
    }
  };

  const confirmRoyaltyUpload = async () => {
    if (!pendingFormData) return;

    pendingFormData.append("payRoyalty", "true");

    try {
      await axios.post("/api/post", pendingFormData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      setRoyaltyModalOpen(false);
      setPendingFormData(null);
      onUpload();
      setSnackbarMessage("Royalty confirmed and image uploaded!");
      setSnackbarOpen(true);
      setCaption("");
      setImage(null);
      setImagePreview(null);
      setRequireRoyalty(false);
    } catch (err: any) {
      setSnackbarMessage("Royalty upload failed.");
      setSnackbarOpen(true);
      console.error("Royalty upload error:", err);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          color: theme.palette.primary.main,
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontWeight: 500,
        }}
      >
        <CloudUploadIcon /> Share a Moment
      </Typography>

      <TextField
        label="Caption"
        fullWidth
        margin="normal"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: theme.shape.borderRadius,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
            </InputAdornment>
          ),
        }}
      />

      {imagePreview ? (
        <Paper
          elevation={1}
          sx={{
            position: "relative",
            mb: 2,
            p: 1,
            borderRadius: theme.shape.borderRadius,
            border: "1px solid #ccc",
            overflow: "visible",
          }}
        >
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              backgroundColor: "rgba(255,255,255,0.9)",
              color: theme.palette.error.main,
              zIndex: 2,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
            }}
            onClick={clearImage}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Box
            component="img"
            src={imagePreview}
            alt="Preview"
            sx={{
              width: "100%",
              maxHeight: "200px",
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        </Paper>
      ) : (
        <Button
          component="label"
          variant="outlined"
          fullWidth
          startIcon={<ImageIcon />}
          sx={{
            mb: 2,
            py: 2,
            borderRadius: theme.shape.borderRadius,
            border: `1px dashed ${theme.palette.divider}`,
            color: theme.palette.text.primary,
          }}
        >
          Select Image
          <input type="file" accept="image/*" onChange={handleImageChange} hidden />
        </Button>
      )}

      <FormControlLabel
        control={
          <Switch
            checked={requireRoyalty}
            onChange={(e) => setRequireRoyalty(e.target.checked)}
            color="primary"
          />
        }
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CopyrightIcon fontSize="small" color="primary" />
            <Typography variant="body2">Require royalty if reposted</Typography>
          </Box>
        }
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        fullWidth
        sx={{
          py: 1.5,
          borderRadius: theme.shape.borderRadius,
        }}
        startIcon={<CloudUploadIcon />}
      >
        Upload
      </Button>

      <Dialog
        open={royaltyModalOpen}
        onClose={() => setRoyaltyModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.primary.main }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CopyrightIcon />
            Royalty Required
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            This image matches a post that requires royalty payment. Do you want to proceed with the payment?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setRoyaltyModalOpen(false)}
            variant="outlined"
            sx={{ borderRadius: theme.shape.borderRadius }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmRoyaltyUpload}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: theme.shape.borderRadius,
            }}
          >
            Confirm &amp; Pay Royalty
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbarMessage.includes("failed") ? "error" : "success"}
          sx={{
            borderRadius: theme.shape.borderRadius,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadSection;
