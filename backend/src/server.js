const express = require('express');
const app = express();
const workerRoutes = require('./routes/worker/workerRoutes');

app.use(express.json());

// Mount Angela's worker endpoints under /api/worker
app.use('/api/worker', workerRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));