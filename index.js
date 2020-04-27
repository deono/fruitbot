const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('You found the homework bot');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`homeworkbot is listening on port ${PORT}`);
});
