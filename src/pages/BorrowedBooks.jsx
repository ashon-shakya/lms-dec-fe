import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBorrow, returnBook } from "../features/borrow/borrowAction";
import { addReview } from "../features/review/reviewAction";
import bookPlaceHolder from "../assets/book_placeholder.jpg";
import { useEffect, useState } from "react";

function BorrowedBooks() {
  const dispatch = useDispatch();
  const { borrows } = useSelector((state) => state.borrowStore);
  const activeBooks = borrows.filter((b) => b.status === "borrowed");
  const returnedBooks = borrows.filter(
    (b) => b.status === "returned" || b.status === "reviewed",
  );

  // modal state
  const [modal, setModal] = useState(null); // holds the borrow object
  const [rating, setRating] = useState(3);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchMyBorrow());
  }, []);

  const openModal = async (borrowObj) => {
    // Return the book first — backend requires status "returned" before review
    await dispatch(returnBook({ _id: borrowObj._id, status: "returned" }));
    setModal(borrowObj);
    setRating(3);
    setReviewText("");
  };

  const closeModal = () => setModal(null);

  const doReturn = (borrowObj) => {
    dispatch(returnBook({ _id: borrowObj._id, status: "returned" }));
  };

  // Cancel: just return the book, no review
  const handleCancel = () => {
    doReturn(modal);
    closeModal();
  };

  // Submit: add review first, then the backend marks borrow as "reviewed"
  const handleSubmit = async () => {
    if (!reviewText.trim())
      return alert("Please write a review before submitting.");
    setSubmitting(true);
    try {
      const data = await addReviewApi(modal._id, {
        review: reviewText,
        rating,
      });
      if (data.status === "success") {
        dispatch(fetchMyBorrow()); // refresh borrow list
      } else {
        alert(data.message || "Could not save review, book returned anyway.");
      }
    } catch {
      alert("Could not save review, book returned anyway.");
    }
    setSubmitting(false);
    closeModal();
  };

  // Book is already returned; just close the modal
  const handleSkip = () => closeModal();

  return (
    <div>
      {/* ── Review / Return Modal ── */}
      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "4px",
              width: "100%",
              maxWidth: "480px",
              padding: "2rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            {/* header */}
            <h5 className="fw-bold mb-1" style={{ letterSpacing: "-0.02em" }}>
              Return &amp; Rate
              <button onClick={() => closeModal()}>Close</button>
            </h5>
            <p className="text-muted small mb-4">
              <span className="fw-semibold">{modal.bookId?.title}</span> — leave
              an optional review before returning.
            </p>

            {/* slider rating */}
            <div className="mb-4">
              <label
                htmlFor="ratingSlider"
                className="fw-bold text-uppercase small mb-2 d-flex justify-content-between"
                style={{ letterSpacing: "1px" }}
              >
                <span>Rating</span>
                <span className="text-warning fw-bold">{rating} / 5 ★</span>
              </label>
              <input
                id="ratingSlider"
                type="range"
                className="form-range"
                min={1}
                max={5}
                step={1}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />
              <div
                className="d-flex justify-content-between text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                <span>1 – Poor</span>
                <span>3 – Okay</span>
                <span>5 – Excellent</span>
              </div>
            </div>

            {/* review text */}
            <label
              className="fw-bold text-uppercase small mb-2 d-block"
              style={{ letterSpacing: "1px" }}
            >
              Review <span className="text-muted fw-normal"></span>
            </label>
            <textarea
              className="form-control rounded-0 mb-4"
              rows={4}
              placeholder="Share your thoughts about this book…"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              style={{ resize: "none", fontSize: "0.9rem" }}
              required
            />

            {/* actions */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-dark rounded-0 px-4 fw-bold text-uppercase flex-fill"
                style={{ letterSpacing: "1px", fontSize: "0.8rem" }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="page-header">
        <Container>
          <h1>My Borrowed Books</h1>
          <p>Track your currently borrowed books and borrowing history.</p>
        </Container>
      </div>

      <Container className="py-4">
        {/* Currently Borrowed */}
        {activeBooks.length > 0 && (
          <>
            <h5 className="section-title mb-4">Currently Borrowed</h5>
            <Row className="g-4 mb-5 mt-1">
              {activeBooks.map((borrow) => (
                <Col md={6} key={borrow._id}>
                  <div className="borrowed-card">
                    <div className="borrowed-cover">
                      <img
                        src={borrow.bookId.thumbnail || bookPlaceHolder}
                        alt={borrow.bookId.title}
                      />
                    </div>
                    <div className="borrowed-info">
                      <div>
                        <span className="badge-status badge-active mb-2">
                          {borrow.status}
                        </span>
                        <h6 className="fw-bold mt-2 mb-1">
                          {borrow.bookId.title}
                        </h6>
                        <p className="text-muted small mb-3">
                          by {borrow.bookId.author}
                        </p>
                        <div className="d-flex gap-4 small text-muted">
                          <div>
                            <span
                              className="d-block fw-bold text-uppercase"
                              style={{
                                fontSize: "0.65rem",
                                letterSpacing: "1px",
                              }}
                            >
                              Borrowed
                            </span>
                            {new Date(borrow.borrowDate).toLocaleDateString(
                              "en-AU",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </div>
                          <div>
                            <span
                              className="d-block fw-bold text-uppercase"
                              style={{
                                fontSize: "0.65rem",
                                letterSpacing: "1px",
                              }}
                            >
                              Due
                            </span>
                            {new Date(borrow.dueDate).toLocaleDateString(
                              "en-AU",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          className="btn-action btn-action-return"
                          onClick={() => dispatch(returnBook(borrow))}
                        >
                          Return Book
                        </button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* Returned / Reviewed History */}
        {returnedBooks.length > 0 && (
          <>
            <h5 className="section-title mb-4">Borrowing History</h5>
            <div className="admin-panel mt-4">
              <div className="table-responsive">
                <table className="lms-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Borrowed</th>
                      <th>Returned</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnedBooks.map((borrow) => (
                      <tr key={borrow._id}>
                        <td>
                          <img
                            src={borrow.bookId?.thumbnail || bookPlaceHolder}
                            alt={borrow.bookId?.title}
                            className="img-fluid"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                        </td>
                        <td className="fw-bold">{borrow.bookId?.title}</td>
                        <td className="text-muted">{borrow.bookId?.author}</td>
                        <td className="text-muted small">
                          {new Date(borrow.borrowDate).toLocaleDateString(
                            "en-AU",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="text-muted small">
                          {borrow.returnDate
                            ? new Date(borrow.returnDate).toLocaleDateString(
                                "en-AU",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </td>
                        <td>
                          <span
                            className={`badge-status ${
                              borrow.status === "reviewed"
                                ? "badge-active"
                                : "badge-returned"
                            }`}
                            onClick={() => openModal(borrow)}
                          >
                            {borrow.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {borrows.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted mb-4">
              You haven't borrowed any books yet.
            </p>
            <Link
              to="/books"
              className="btn btn-dark rounded-0 px-4 text-uppercase fw-bold small"
              style={{ letterSpacing: "1px" }}
            >
              Browse Library
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}

export default BorrowedBooks;
