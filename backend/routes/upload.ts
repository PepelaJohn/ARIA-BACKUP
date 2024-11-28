import axios from "axios";

const express = require("express");
const router = express.Router();
const IMGUR_CLIENT_ID = "7e56eff831d15cb";
router.post("/", async (req: any, res: any) => {
  console.log(req.file, "asdfjlakdjflajdlfa");
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const bufferToBlob = (buffer: Buffer, mimeType: string = 'application/octet-stream'): Blob => {
        return new Blob([buffer], { type: mimeType });
      };

    const blob = bufferToBlob(req.file.buffer, "image/png");
    // Convert the file buffer to a Base64 string
    //   const base64Image = req.file.buffer.toString('base64');

    const formData = new FormData();
    formData.append("image", blob, "image.png");

    // Send the Base64 image to Imgur
    const response = await axios.post(
      "https://api.imgur.com/3/image",
      { image: formData }, // Pass the base64 image here
      {
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
      }
    );

    const imageUrl = response.data.data.link; // Extract the uploaded image URL
    res.json({ imageUrl });
  } catch (error: any) {
    console.error("Error uploading image:", error.message);
    res.status(500).json({ error: "Image upload failed" });
  }
});

export default router;
