const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sha256 = require("js-sha256");

const app = express();

const apiPath = "/api/";
const version = "v1";

const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Our id counters
// We use basic integer ids here, but other solutions (such as UUIDs) would be better
let nextGenreId = 5;
let nextBookId = 4;

// The following is an example of genres and books, same as in assignment 3

// Notice we use 'let' instead of 'const' so that resetState can re-declare
let genres = [
  { id: 1, name: "Fiction" },
  { id: 2, name: "Non-Fiction" },
  { id: 3, name: "Science Fiction" },
  { id: 4, name: "Fantasy" },
];

// Notice we use 'let' instead of 'const' so that resetState can re-declare
let books = [
  { id: 1, title: "Pride and Prejudice", author: "Jane Austin", genreId: 1 },
  {
    id: 2,
    title: "Independent People",
    author: "Halldór Laxnes",
    genreId: 1,
  },
  {
    id: 3,
    title: "Brief Answers to the Big Questions",
    author: "Stephen Hawking",
    genreId: 2,
  },
];

/* --------------------------

        BOOKS ENDPOINTS     

-------------------------- */

// GET all books
app.get(apiPath + version + "/books", (req, res) => {
  // Define allowed query parameters
  const allowedQueryParams = ["filter"];
  // Get all query parameters from the request
  const queryParams = Object.keys(req.query);
  // Check if only allowed query parameters have been sent with the request
  const isQueryParamAllowed = queryParams.every((param) =>
    allowedQueryParams.includes(param)
  );

  if (!isQueryParamAllowed) {
    // If there are query parameters other than 'filter', return a 400 Bad Request
    return res
      .status(400)
      .json({ error: 'Invalid query parameter. Only "filter" is allowed.' });
  }
  const bookArray = [];

  // Add all books to the bookArray, if no filter was applied
  if (!req.query.filter) {
    books.map((book) =>
      bookArray.push({
        id: book.id,
        title: book.title,
        author: book.author,
        genreId: book.genreId,
      })
    );
  } else {
    // Find the relevant genre from the filter, using lowercase to be avoid case-sensitivity
    const genre = genres.find(
      (genre) => genre.name.toLowerCase() === req.query.filter.toLowerCase()
    );

    // Return an empty array if this genre was now found
    if (!genre) {
      return res.status(200).json(bookArray);
    }

    // Add all books, for the filtered genre to the bookArray
    books.forEach((book) => {
      if (book.genreId === genre.id) {
        bookArray.push({
          id: book.id,
          title: book.title,
          author: book.author,
          genreId: book.genreId,
        });
      }
    });
  }

  // Return the bookArray with 200 OK
  res.status(200).json(bookArray);
});

// GET single book
app.get(apiPath + version + "/genres/:genreId/books/:bookId", (req, res) => {
  // Check for book in the requested genre
  const foundBook = books.find(
    (book) =>
      parseInt(book.id) === parseInt(req.params.bookId) &&
      parseInt(book.genreId) === parseInt(req.params.genreId)
  );

  // If the book was not found, do more checks and route the request accordingly
  if (!foundBook) {
    // Check if book exists, without checking for genre
    const bookwithId = books.find(
      (book) => parseInt(book.id) === parseInt(req.params.bookId)
    );

    // Return an 404 not found it book does not exists
    if (!bookwithId) {
      return res.status(404).json({
        message: `Book with id ${req.params.bookId} does not exist`,
      });
    }

    // Return an 400 error, if the book exists, just not in the provided genreId, i.e. bad request
    return res.status(400).json({
      message: `Book with id ${req.params.bookId} does not belong to genre with id ${req.params.genreId}.`,
    });
  }

  // Return the requested book
  return res.status(200).json(foundBook);
});

// POST books
app.post(apiPath + version + "/genres/:genreId/books", (req, res) => {
  // Check if genreId is of correct format within the URL request
  if (!Number.isInteger(parseInt(req.params.genreId))) {
    return res.status(400).send({ error: `genreId must be an integer` });
  }

  // Deconstruct the title, and author from the body
  const { title, author } = req.body;
  // Parse the genreId to integer
  const genreId = parseInt(req.params.genreId);
  // Check if all necessary parameters are included in the POST request
  if (!req.body || !title || !author) {
    return res.status(400).json({
      message: "Missing required book fields within the body (title, author).",
    });
  }
  // Check if the body parameters are of the correct format
  if (typeof title !== "string" || typeof author !== "string") {
    return res.status(400).json({
      message: "title, and author should be strings",
    });
  }

  // Check if genre exists
  const genreExists = genres.some((genre) => parseInt(genre.id) === genreId);

  // Return an error if the genre does not exists
  if (!genreExists) {
    return res.status(400).json({
      message: `Error when creating book, cannot create a book for a genre that does not exists`,
    });
  }

  // Create and push the new book
  const newBook = {
    id: nextBookId,
    title: req.body.title,
    author: req.body.author,
    genreId: genreId,
  };

  books.push(newBook);
  // Increment the nextBookId, for future requests
  nextBookId++;
  // Return the newBook with 201 Created
  res.status(201).json(newBook);
});

// PATCH book
app.patch(apiPath + version + "/genres/:genreId/books/:bookId", (req, res) => {
  // Check if bookId is of correct format within the URL request
  if (!Number.isInteger(parseInt(req.params.bookId))) {
    return res.status(400).send({ error: `bookId must be an integer` });
  }
  // Check if genreId is of correct format within the URL request
  if (!Number.isInteger(parseInt(req.params.genreId))) {
    return res.status(400).send({ error: `genreId must be an integer` });
  }

  // Deconstruct the title, author, and genreId from the body
  const { title, author, genreId } = req.body;
  // Set, and parse to integer the oldGenreId as the genre from the request URL
  const oldGenreId = parseInt(req.params.genreId);
  // Set, and parse to integer the bookId
  const bookId = parseInt(req.params.bookId);

  // Check if the body parameters exists, and are of the correct format
  if (
    !req.body ||
    ((!title || typeof title !== "string") &&
      (!author || typeof author !== "string") &&
      !genreId)
  ) {
    return res.status(400).json({
      message:
        "To update a book, you need to provide a title, an author, or a new genreId.",
    });
  }

  // Check if book that is being updated exists
  const foundBookWithId = books.findIndex(
    (book) => parseInt(book.id) === bookId
  );

  // If book was not found, send 404 not found error
  if (foundBookWithId < 0) {
    return res.status(404).json({
      message: "Book with id " + bookId + " does not exist.",
    });
  }

  // Find the index of the book, in the books array, to use for the update
  const foundBookId = books.findIndex(
    (book) =>
      parseInt(book.id) === bookId && parseInt(book.genreId) === oldGenreId
  );

  // If books was not found, within the specific genre, an 404 error is sent
  if (foundBookId < 0) {
    return res.status(404).json({
      message: `Book with id ${bookId} does not exists in genre id ${oldGenreId}.`,
    });
  }

  // Update genre if applicable
  if (genreId) {
    const genreExists = genres.some(
      (genre) => parseInt(genre.id) === parseInt(genreId)
    );

    if (!genreExists) {
      return res.status(404).json({
        message: `Genre with id ${genreId} does not exist.`,
      });
    }

    books[foundBookId].genreId = genreId;
  }

  // Update title if applicable
  if (title) {
    books[foundBookId].title = title;
  }

  // Update author if applicable
  if (author) {
    books[foundBookId].author = author;
  }

  // Return the updated book with 200 OK
  return res.status(200).json(books[foundBookId]);
});

// DELETE book
app.delete(apiPath + version + "/books/:bookId", (req, res) => {
  // Check if bookId is of correct format within the URL request
  if (!Number.isInteger(parseInt(req.params.bookId))) {
    return res.status(400).send({ error: `bookId must be an integer` });
  }
  // Find the index of the book, in the books array, to use for the deletion
  const deletedBookIndex = books.findIndex(
    (book) => parseInt(book.id) === parseInt(req.params.bookId)
  );

  // If the requested book to delete, does not exists, return an 404 not found error
  if (deletedBookIndex < 0) {
    return res
      .status(404)
      .json({ message: `Book with id ${req.params.bookId} does not exist.` });
  }

  // Get the book before deletion
  const deletedBook = books[deletedBookIndex];
  // Remove the book from the books array
  books.splice(deletedBookIndex, 1);
  // Return the deleted book in the body with 200 OK
  res.status(200).send(deletedBook);
});

// Handler to catch DELETE requests without a specific bookId and return a 405 Method Not Allowed
// This can either be done seperately or within the allowed get request with and optional parameter bookId
app.delete(apiPath + version + "/books", (req, res) => {
  res.status(405).send({ error: "Method Not Allowed" });
});

/* --------------------------

        GENRES ENDPOINTS     

-------------------------- */

// GET genres
app.get(apiPath + version + "/genres", (req, res) => {
  // Return all genres, with 200 OK
  res.status(200).json(genres);
});

app.post(apiPath + version + "/genres", (req, res) => {
  // Authentication check
  const hmacHash = sha256.hmac(
    "bookSecret",
    req.method.toLowerCase() + " " + req.path.toLowerCase()
  );

  if (!req.header("Authorization")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const authMethod = req.header("Authorization").substring(0, 4);
  const hash = req.header("Authorization").substring(5);

  if (authMethod !== "HMAC") {
    return res.status(403).json({ message: "Wrong authorization method." });
  }

  if (hash !== hmacHash) {
    return res.status(403).json({ message: "Wrong hash." });
  }

  // Deconstruct name from the body
  const { name } = req.body;
  // Check if all necessary parameters are included in the POST request
  if (!req.body || !name) {
    return res.status(400).json({
      message: "Genre creation requires a name.",
    });
  }
  // Check if the body parameters are of the correct format
  if (typeof name !== "string") {
    return res.status(400).json({
      message: "name should be a string",
    });
  }

  // Create a new genre object
  const newGenre = {
    id: nextGenreId,
    name: name,
  };

  // Check if genre with this name exists, return an 400 error if it exists before
  if (
    genres.some(
      (genre) => genre.name.toLowerCase() === newGenre.name.toLowerCase()
    )
  ) {
    return res.status(400).json({
      message: `A genre with name ${newGenre.name} already exists.`,
    });
  }

  // Add the new genre, and increment nextGenreId for future requests
  genres.push(newGenre);
  nextGenreId++;

  // Return the new genre, with 201 Created
  res.status(201).json(newGenre);
});

// DELETE genre
app.delete(apiPath + version + "/genres/:genreId", (req, res) => {
  // Set, and parse the genreId to integer
  const genreId = parseInt(req.params.genreId);
  // Check if genreId is of correct type
  if (!Number.isInteger(genreId)) {
    return res.status(400).send({ error: `$genreId must be an integer` });
  }
  // Find the index for the genre, for deletion
  const deletedGenreIndex = genres.findIndex(
    (genre) => parseInt(genre.id) === genreId
  );

  // If the genre in the request is not found, respons with 404 not found
  if (deletedGenreIndex < 0) {
    return res.status(404).json({
      message: `Genre with id ${genreId} does not exist.`,
    });
  }

  // Check if the requested genre, has some books linked to it
  const genreHasBooks = books.some(
    (book) => parseInt(book.genreId) === genreId
  );

  // If the genre has linked books, then return 400 bad request
  if (genreHasBooks) {
    return res.status(400).json({
      message: "Cannot delete genre, as it is used by at least one book.",
    });
  }
  /// Get the genre before deletion
  const deletedGenre = genres[deletedGenreIndex];
  // Remove the genre from the books array
  genres.splice(deletedGenreIndex, 1);
  // Return the deleted genre in the body with 200 OK
  return res.status(200).json(deletedGenre);
});

// Handler to catch DELETE requests without a specific bookId and return a 405 Method Not Allowed
// This can either be done seperately or within the allowed get request with and optional parameter bookId
app.delete(apiPath + version + "/genres", (req, res) => {
  res.status(405).send({ error: "Method Not Allowed" });
});

// Addition to the assignment 3 solution to help you have a "clean-base" for your testing
app.get(apiPath + version + "/reset", (req, res) => {
  genres = [
    { id: 1, name: "Fiction" },
    { id: 2, name: "Non-Fiction" },
    { id: 3, name: "Science Fiction" },
    { id: 4, name: "Fantasy" },
  ];

  books = [
    { id: 1, title: "Pride and Prejudice", author: "Jane Austin", genreId: 1 },
    {
      id: 2,
      title: "Independent People",
      author: "Halldór Laxnes",
      genreId: 1,
    },
    {
      id: 3,
      title: "Brief Answers to the Big Questions",
      author: "Stephen Hawking",
      genreId: 2,
    },
  ];

  nextBookId = 4;
  nextGenreId = 5;

  return res.status(200).json({ message: "State reset successful." });
});

// Start the server if the app is being started
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Library app listening on port ${port}`);
  });
}

module.exports = app; // Export the app for testing
