import React, { useRef, useState } from "react";
import { Upload, Link2 } from "lucide-react";

const UploadCard = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

   const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageURL("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

   const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImageFile(file);
      setImageURL("");
    }
    setIsDragging(false);
  };

    const handleURLChange = (e) => {
    setImageURL(e.target.value);
    setImageFile(null); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-6">
      {/* Card container */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-purple-700/30">
        
        {/* Upload box */}
        <div
          className={`border-2 ${
            isDragging ? "border-purple-500" : "border-dashed border-gray-600"
          } rounded-xl flex flex-col items-center justify-center p-10 text-center cursor-pointer transition-colors duration-200`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload
            size={40}
            className={`mb-3 ${
              isDragging ? "text-purple-400" : "text-gray-400"
            } transition-colors duration-200`}
          />
          <p className="text-gray-200 font-medium">
            Drop an image here <br /> or click to browse
          </p>
         <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
        </div>

        {/* Image URL input */}
        <div className="flex items-center bg-white/10 border border-white/10 rounded-lg mt-4 px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500 transition">
          <Link2 size={18} className="text-gray-400 mr-2" />
            <input
            type="text"
            placeholder="Or paste image URL"
            value={imageURL}
            onChange={handleURLChange}
            className="w-full bg-transparent outline-none text-gray-200 placeholder-gray-400 text-sm"
          />
        </div>

        {/* Button */}
        <button
          className="w-full mt-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-semibold shadow-lg transition transform hover:scale-105 hover:shadow-purple-600/40 active:scale-95"
          onClick={() => {
            if (imageFile) {
              console.log("Submitting file:", imageFile);
            } else if (imageURL) {
              console.log("Submitting URL:", imageURL);
            } else {
              alert("Please upload an image or paste an image URL!");
            }
          }}
        >
          Find Similar Products
        </button>

        {/* Helper text */}
        <p className="text-center text-xs text-gray-400 mt-3">
          Upload or paste an image to find similar items
        </p>

        {/* Preview Placeholder */}
        {(imageFile || imageURL) && (
          <div className="mt-5">
            <p className="text-gray-300 text-sm mb-2">Preview:</p>
            <img
              src={
                imageFile
                  ? URL.createObjectURL(imageFile)
                  : imageURL
              }
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg border border-gray-700"
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default UploadCard;
