// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');
const cors = require('cors');

// config
const PORT = process.env.PORT || 5000;
const PYTHON_EXEC = 'python'; // or full path to python exe/venv python
const PY_SCRIPT = path.join(__dirname, 'compute_embedding.py');
const FEATURES_FILE = path.join(__dirname, 'product_features.json'); // downloaded from Colab

// load product features (array of objects)
if (!fs.existsSync(FEATURES_FILE)) {
  console.error('product_features.json not found. Place it in backend folder.');
  process.exit(1);
}
const products = JSON.parse(fs.readFileSync(FEATURES_FILE, 'utf8'));

// convert embeddings to Float32Array for fast math
products.forEach(p => {
  p.embedding = p.embedding.map(x => Number(x)); // ensure numeric
  // optionally precompute norm
  p._norm = Math.sqrt(p.embedding.reduce((s, v) => s + v * v, 0));
});

// set up multer for uploads
const upload = multer({
  dest: path.join(__dirname, 'uploads/'),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get('/', (req, res) => res.json({ message: 'Image similarity server running' }));

// core endpoint
app.post('/find-similar', upload.single('image'), async (req, res) => {
  try {
    // accept either file upload or imageUrl field (we will support file now)
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Send multipart/form-data with key "image"' });
    }
    const uploadedPath = path.resolve(req.file.path);

    // Call Python script to compute embedding
    // using spawnSync to keep it simple and synchronous
    const py = spawnSync(PYTHON_EXEC, [PY_SCRIPT, uploadedPath], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });

    if (py.error) {
      console.error('Python spawn error', py.error);
      return res.status(500).json({ error: 'Failed to run python script', detail: String(py.error) });
    }
    if (py.status !== 0 && py.stdout.trim() === '') {
      // maybe script printed error to stdout
      console.error('Python returned non-zero status', py.stderr);
    }

    let out;
    try {
      out = JSON.parse(py.stdout);
    } catch (err) {
      // sometimes python prints warnings; try to parse last JSON chunk
      const s = py.stdout.trim();
      const jsonStr = s.substring(s.indexOf('{'));
      out = JSON.parse(jsonStr);
    }

    if (out.error) {
      console.error('Python script error:', out.error);
      return res.status(500).json({ error: out.error });
    }

    const queryEmbedding = out.embedding.map(x => Number(x));
    const queryNorm = Math.sqrt(queryEmbedding.reduce((s, v) => s + v * v, 0));

    // compute cosine similarity with all products
    function cosineSim(a, b, na, nb) {
      let dot = 0;
      for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
      return dot / (na * nb + 1e-12);
    }

    const results = products.map(p => {
      const sim = cosineSim(queryEmbedding, p.embedding, queryNorm, p._norm || 1);
      return { ...p, similarity: sim };
    });

    // sort by similarity descending
    results.sort((a, b) => b.similarity - a.similarity);

    const topN = results.slice(0, 6).map(r => ({
      uniq_id: r.uniq_id,
      product_name: r.product_name,
      category: r.product_category_tree,
      retail_price: r.retail_price,
      discounted_price: r.discounted_price,
      image: r.first_image_url,
      product_specifications: r.product_specifications,
      similarity: r.similarity
    }));

    // delete uploaded file
    fs.unlinkSync(uploadedPath);

    return res.json({ results: topN });
  } catch (err) {
    console.error('Server error', err);
    return res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
