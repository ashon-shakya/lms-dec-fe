import { Container, Row, Col } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { borrowBook } from "../features/borrow/borrowAction";

function BookDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { publicBooks } = useSelector((state) => state.bookStore);
  const [book, setBook] = useState({});

  const handleBorrow = (bookId) => {
    dispatch(borrowBook(bookId));
  };

  useEffect(() => {
    setBook(publicBooks.find((b) => b._id == id));
  }, [publicBooks, id]);

  if (!book) {
    return (
      <Container className="py-5 text-center">
        <h2 className="fw-bold mb-3">Book Not Found</h2>
        <p className="text-muted mb-4">
          The book you're looking for doesn't exist in our catalog.
        </p>
        <Link to="/books" className="btn btn-dark rounded-0 px-4">
          Back to Catalog
        </Link>
      </Container>
    );
  }

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = "★".repeat(full);
    if (hasHalf) stars += "½";
    return stars;
  };

  return (
    <div>
      <div className="page-header">
        <Container>
          <Link
            to="/books"
            className="text-decoration-none text-muted small text-uppercase"
            style={{ letterSpacing: "1px" }}
          >
            ← Back to Catalog
          </Link>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="g-5">
          {/* Book Cover */}
          <Col lg={5}>
            <div className="book-detail-cover">
              <img src={book.thumbnail} alt={book.title} />
            </div>
          </Col>

          {/* Book Info */}
          <Col lg={7}>
            <div className="mb-2">
              <span
                className={`badge-status ${book.isAvailable ? "badge-available" : "badge-reserved"}`}
              >
                {book.isAvailable ? "Available" : "Currently Reserved"}
              </span>
            </div>

            <h1
              className="fw-bold mb-1"
              style={{ fontSize: "2.25rem", letterSpacing: "-0.02em" }}
            >
              {book.title}
            </h1>
            <p className="text-muted fs-5 mb-4">by {book.author}</p>

            <div className="mb-4">
              <span className="book-rating fs-5 me-2">
                {renderStars(book.rating)}
              </span>
              <span className="text-muted">({book.rating} / 5.0)</span>
            </div>

            <p className="mb-4" style={{ lineHeight: 1.8, color: "#374151" }}>
              {book.description}
            </p>

            <hr className="my-4" />

            <dl className="book-detail-info">
              <Row>
                <Col sm={6}>
                  <dt>ISBN</dt>
                  <dd>{book.isbn}</dd>
                </Col>
                <Col sm={6}>
                  <dt>Genre</dt>
                  <dd>{book.genre}</dd>
                </Col>
                <Col sm={6}>
                  <dt>Publication Year</dt>
                  <dd>{book.publicationYear}</dd>
                </Col>
                <Col sm={6}>
                  <dt>Average Rating</dt>
                  <dd>{book.averageRating} / 5.0</dd>
                </Col>
              </Row>
            </dl>

            <div className="d-flex gap-3 mt-4">
              {book.isAvailable ? (
                <button
                  className="btn btn-dark rounded-0 px-5 py-3 text-uppercase fw-bold"
                  style={{ letterSpacing: "2px" }}
                  onClick={() => handleBorrow(book._id)}
                >
                  Borrow This Book
                </button>
              ) : (
                <button
                  className="btn btn-outline-secondary rounded-0 px-5 py-3 text-uppercase fw-bold disabled"
                  style={{ letterSpacing: "2px" }}
                >
                  Currently Reserved
                </button>
              )}
              <Link
                to="/books"
                className="btn btn-outline-dark rounded-0 px-4 py-3 text-uppercase fw-bold"
                style={{ letterSpacing: "1px" }}
              >
                Browse More
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default BookDetail;
