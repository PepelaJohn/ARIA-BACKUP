import React, { useState } from "react";
import axios from "axios";

const ImageUpload = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response1 = await axios.post(
        "https://api.imgur.com/3/image",
        { image: formData }, // Pass the base64 image here
        {
          headers: {
            Authorization: `Client-ID ${"7e56eff831d15cb"}`,
          },
        }
      );

      const imageUrl = response1.data.data.link;
      console.log(imageUrl);
      alert()
      console.log(response1.status, response1.data);
      const response = await axios.post(
        "http://localhost:3000/api/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setImageUrl(response.data.imageUrl); // Display the uploaded image URL
    } catch (error) {
      console.error("Error uploading image", error);
    }
  };

  return (
    <div className="nav-h flex-col items-center justify-center">
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload</button>

      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
};

export default ImageUpload;
