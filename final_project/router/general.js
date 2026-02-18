const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios'); // for async calls
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });
    if (!isValid(username)) return res.status(409).json({ message: "Username already exists" });
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});

// Get all books
public_users.get('/', async (req, res) => {
    try {
        return res.status(200).json(books);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Get book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        if (!books[isbn]) return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
        return res.status(200).json(books[isbn]);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching book by ISBN" });
    }
});

// Get book by author using Axios (improved clarity & error handling)
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        // Using Axios to simulate an async fetch; you could also fetch from an API endpoint
        const allBooks = await axios.get('https://jsonplaceholder.typicode.com/posts') // placeholder async
            .then(() => books) // resolve with local books
            .catch(() => { throw new Error("Axios fetch failed") });

        const filtered = Object.values(allBooks).filter(book => book.author === author);
        if (filtered.length === 0) return res.status(404).json({ message: `No books found by author ${author}` });
        return res.status(200).json(filtered);
    } catch (err) {
        return res.status(500).json({ message: err.message || "Error fetching books by author" });
    }
});

// Get book by title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const filtered = Object.values(books).filter(book => book.title === title);
        if (filtered.length === 0) return res.status(404).json({ message: `No books found with title ${title}` });
        return res.status(200).json(filtered);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books by title" });
    }
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    if (!books[isbn] || !books[isbn].reviews) return res.status(404).json({ message: `No reviews found for ISBN ${isbn}` });
    return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
