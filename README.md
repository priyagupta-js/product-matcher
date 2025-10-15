# Visual Product Matcher

## Project Description

The **Visual Product Matcher** is a web-based system that allows users to **upload an image or enter an image URL**, and instantly find **visually similar products** from a dataset or image collection.

It is designed for e-commerce or catalog-based systems where finding look-alike items (e.g., clothing, furniture, accessories) based on appearance is important.

The system uses **deep learning–based feature extraction** to understand image content and **similarity search** to find the closest matches.

---

##  Objective

To build an **end-to-end image similarity system** with:

1. An easy-to-use **UI** for image upload or URL input.
2. A **backend** that processes the image, extracts features, and finds similar images.
3. Integration of **pre-trained CNN models** (e.g., ResNet) for feature extraction.
4. A **database or folder** with product metadata to display results with details.

---

## System Architecture

```
          ┌───────────────────────┐
          │        FRONTEND       │
          │        React
          │ Upload or URL Input   │
          └──────────┬────────────┘
                     │
          ┌──────────▼────────────┐
          │       BACKEND         │
          │ Node.js (Express)     │
          │ + Python (ResNet)     │
          │ - Receives image      │
          │ - Extracts features   │
          │ - Compares similarity │
          └──────────┬────────────┘
                     │
          ┌──────────▼────────────┐
          │   IMAGE DATABASE      │
          │ (images + metadata)   │
          │ e.g., JSON / CSV      │
          └──────────┬────────────┘
                     │
          ┌──────────▼────────────┐
          │      RESULTS UI       │
          │ Show similar images   │
          │ + product details     │
          └───────────────────────┘
```

---

## Approach Followed

### 1. **Frontend (User Interface)**

* Developed a **simple upload form** that allows users to:

  * Upload an image or paste an image URL.
  * Display the uploaded image preview.
* Sends the image to the backend for processing via **HTTP POST**.

### 2. **Backend (Server Layer)**

* Implemented with **Node.js + Express**.
* Uses **Multer** to handle image uploads.
* On receiving an image:

  * Calls a **Python script** (via `child_process.spawnSync`) for similarity search.
  * Returns the top similar images with metadata as JSON.

### 3. **Python Processing (Model Layer)**

* Uses a **pre-trained CNN model** (e.g., **ResNet-50**) from PyTorch or TensorFlow.
* Extracts **feature embeddings** from each image (e.g., 2048-dimensional vectors).
* Computes similarity between uploaded image and database images using **cosine similarity** or **Euclidean distance**.
* Returns the **top-k most similar images** with their metadata.

### 4. **Data & Metadata**

* A small dataset (folder) of product images with a CSV/JSON file containing:

  ```json
  [
    {"id": 1, "filename": "shirt1.jpg", "name": "Blue Cotton Shirt", "price": "₹999"},
    {"id": 2, "filename": "shirt2.jpg", "name": "Formal White Shirt", "price": "₹1199"}
  ]
  ```
* Each image is preprocessed once to store its feature vector, reducing runtime computation.

---

## Pre-trained Model Used

### 🔹 **ResNet (Residual Network)**

* A deep convolutional neural network (CNN) trained on ImageNet.
* Known for its “skip connections” which make it very effective for feature extraction.
* We use it **without the final classification layer**, taking the **penultimate layer output** as the **image embedding**.
* These embeddings act as a **visual fingerprint** of each image for comparison.

---

## Workflow Summary

1. User uploads or pastes image URL →
2. Node.js backend saves it →
3. Python model extracts features →
4. Computes similarity with stored features →
5. Sends top results (images + metadata) →
6. Frontend displays similar items neatly.

---

## Tech Stack

| Layer         | Technology                             |
| ------------- | -------------------------------------- |
| Frontend      | React
| Backend       | Node.js, Express, Multer               |
| AI Model      | Python, TensorFlow, ResNet     |
| Storage       | Local image folder + metadata JSON     |
| Communication | REST API (JSON responses)              |

---

## Key Features

✅ Upload or paste image URL
✅ See top visually similar products
✅ Display metadata (name, price, etc.)
✅ Uses pre-trained deep learning models
✅ Modular and extendable (can connect to cloud DB or API later)

---

## Future Enhancements

* Add vector database (e.g., **FAISS** or **Pinecone**) for faster similarity search.
* Use **CLIP (OpenAI)** or **Vision Transformer (ViT)** for better embedding quality.
* Deploy on **AWS / Render / Vercel** for full-stack hosting.
* Add filtering or category-based search options.

