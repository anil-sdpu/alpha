const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRouter = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Alpha Tuition API' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
