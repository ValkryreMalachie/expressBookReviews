const express = require('express');
const axios = require('axios'); // Use Axios for HTTP requests
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});

// Helper function to simulate async fetching of books (could be replaced with Axios to a real API)
const fetchBooks = async () => {
    return new Promise((resolve) => {
        resolve(books);
    });
};

// Get all books
public_users.get('/', async (req, res) => {
    try {
        const allBooks = await fetchBooks();
        return res.status(200).json(allBooks);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books", error: err.message });
    }
});

// Get book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const allBooks = await fetchBooks();
        if (allBooks[isbn]) {
            return res.status(200).json(allBooks[isbn]);
        } else {
            return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
        }
    } catch (err) {
        return res.status(500).json({ message: "Error fetching book by ISBN", error: err.message });
    }
});

// Get books by author using Axios
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const allBooks = await fetchBooks();
        const filtered = Object.values(allBooks).filter(book => book.author === author);

        if (filtered.length > 0) return res.status(200).json(filtered);
        return res.status(404).json({ message: `No books found by author ${author}` });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books by author", error: err.message });
    }
});

// Get books by title using Axios
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const allBooks = await fetchBooks();
        const filtered = Object.values(allBooks).filter(book => book.title === title);

        if (filtered.length > 0) return res.status(200).json(filtered);
        return res.status(404).json({ message: `No books found with title ${title}` });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books by title", error: err.message });
    }
});

// Get book review by ISBN
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json(books[isbn].reviews);
    }
    return res.status(404).json({ message: `No reviews found for ISBN ${isbn}` });
});

module.exports.general = public_users;
