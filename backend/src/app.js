const express = require('express');
const cors = require('cors');
const instance = require('./routes/instance');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/instances', instance);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app; 