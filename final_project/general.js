const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Task 10: Get all books using async callback function
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/books`);
    console.log('All books:');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting all books:', error.message);
  }
}

// Task 11: Search by ISBN using Promise
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    axios
      .get(`${BASE_URL}/books/isbn/${isbn}`)
      .then((response) => {
        console.log(`Book with ISBN ${isbn}:`);
        console.log(response.data);
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
}

// Task 12: Search by author
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/books/author/${encodeURIComponent(author)}`);
    console.log(`Books by author ${author}:`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting books by author:', error.message);
  }
}

// Task 13: Search by title
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`${BASE_URL}/books/title/${encodeURIComponent(title)}`);
    console.log(`Books with title ${title}:`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting books by title:', error.message);
  }
}

async function runExamples() {
  await getAllBooks();
  await getBookByISBN('1');
  await getBooksByAuthor('Unknown');
  await getBooksByTitle('Things Fall Apart');
}

runExamples();

module.exports = {
  getAllBooks,
  getBookByISBN,
  getBooksByAuthor,
  getBooksByTitle,
};
