const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRouter = require('./routes/api');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

// Serve uploaded files (PDFs, images) from /uploads
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Alpha Tuition API' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
