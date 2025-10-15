# compute_embedding.py
# Usage: python compute_embedding.py /path/to/query.jpg
import sys
import numpy as np
import json
from PIL import Image
from io import BytesIO

# tensorflow imports
import tensorflow as tf
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input



MODEL = None
def load_model():
    global MODEL
    if MODEL is None:
        MODEL = ResNet50(weights='imagenet', include_top=False, pooling='avg')
    return MODEL

def preprocess_image(path_or_bytes):
    # path_or_bytes: either a filepath string OR raw bytes
    if isinstance(path_or_bytes, bytes):
        img = Image.open(BytesIO(path_or_bytes)).convert("RGB")
    else:
        img = Image.open(path_or_bytes).convert("RGB")
    img = img.resize((224, 224))
    arr = np.array(img).astype(np.float32)
    arr = np.expand_dims(arr, axis=0)
    arr = preprocess_input(arr)
    return arr

def compute_embedding_from_path(path):
    model = load_model()
    arr = preprocess_image(path)
    feat = model.predict(arr)
    feat = feat.flatten().tolist()
    return feat

def compute_embedding_from_bytes(bytes_data):
    model = load_model()
    arr = preprocess_image(bytes_data)
    feat = model.predict(arr)
    feat = feat.flatten().tolist()
    return feat

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "no image path provided"}))
        sys.exit(1)
    img_path = sys.argv[1]
    try:
        emb = compute_embedding_from_path(img_path)
        print(json.dumps({"embedding": emb}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
