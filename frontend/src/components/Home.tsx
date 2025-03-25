import React from "react";

import Typography from '@mui/material/Typography';
import UploadForm from "../components/UploadFile";
import Gallery from "../components/Gallery";

const Home = () => {
    return (
        <div>
            <Typography variant="h3" gutterBottom align="center" style={{
                textTransform: "uppercase",
                letterSpacing: 4,
                fontWeight: 'bold',
                margin: 48,
            }}>
                🎨 ArtChain
            </Typography>

            <div className="upload-wrapper">
                <div className="upload-card">
                <h1>Upload Artwork 📁</h1>
                <UploadForm />
                </div>
            </div>

            <Gallery />
        </div>
    );
};

export default Home;