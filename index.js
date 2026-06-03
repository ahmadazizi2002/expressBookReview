const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const books = require('./booksdb.js');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'fingerprint_customer';

const users = [];

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'fingerprint_customer', resave: true, saveUninitialized: true }));

function isValid(username) {
  return users.some((user) => user.username === username);
}

function authenticatedUser(username, password) {
  return users.some((user) => user.username === username && user.password === password);
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'User not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

app.get('/', (req, res) => {
  res.send('Welcome to the Express Book Review API');
});

app.get('/books', (req, res) => {
  res.json(books);
});

app.get('/books/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) return res.json(book);
  return res.status(404).json({ message: 'Book not found' });
});

app.get('/books/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = Object.fromEntries(
    Object.entries(books).filter(([, book]) => book.author.toLowerCase().includes(author))
  );
  res.json(result);
});

app.get('/books/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = Object.fromEntries(
    Object.entries(books).filter(([, book]) => book.title.toLowerCase().includes(title))
  );
  res.json(result);
});

app.get('/books/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book.reviews);
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  users.push({ username, password });
  return res.json({ message: 'User successfully registered. Now you can login' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid login. Check username and password' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  req.session.authorization = { accessToken: token, username };
  return res.json({ message: 'User successfully logged in', token });
});

app.put('/auth/review/:isbn', verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user.username;

  if (!books[isbn]) return res.status(404).json({ message: 'Book not found' });
  if (!review) return res.status(400).json({ message: 'Review is required' });

  books[isbn].reviews[username] = review;
  return res.json({ message: 'Review successfully posted', reviews: books[isbn].reviews });
});

app.delete('/auth/review/:isbn', verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (!books[isbn]) return res.status(404).json({ message: 'Book not found' });

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.json({ message: 'Review successfully deleted' });
  }

  return res.status(404).json({ message: 'Review not found for this user' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
