import { useEffect, useState } from "react";
import { Container, Modal, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getPendingReviews,
  approveReview,
  deleteReview,
} from "../../features/review/reviewAction";

function AdminReviews() {
  const { pendingReviews } = useSelector((store) => store.reviewStore);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPendingReviews());
  }, [dispatch]);

  const handleApprove = async (reviewId) => {
    const result = await dispatch(
      approveReview(reviewId, { isApproved: true }),
    );
    if (result.status === "success") {
      setShowModal(false);
      setSelectedReview(null);
    }
  };

  const handleReject = async (reviewId) => {
    const result = await dispatch(
      approveReview(reviewId, { isApproved: false }),
    );
    if (result.status === "success") {
      setShowModal(false);
      setSelectedReview(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      const result = await dispatch(deleteReview(reviewId));
      if (result.status === "success") {
        setShowModal(false);
        setSelectedReview(null);
      }
    }
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <Container>
          <h1>Manage Reviews</h1>
          <p>Review and approve/reject book reviews from users.</p>
        </Container>
      </div>

      <Container className="py-4">
        {/* Summary Stats */}
        <div className="d-flex gap-4 mb-4">
          <div className="stat-card flex-fill">
            <div className="stat-number">{pendingReviews.length}</div>
            <div className="stat-label">Pending Reviews</div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h5>Pending Reviews ({pendingReviews.length})</h5>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <p>No pending reviews at the moment.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="lms-table">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Reviewer</th>
                    <th>Rating</th>
                    <th>Review</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReviews.map((review) => (
                    <tr key={review._id}>
                      <td className="fw-bold">{review.bookId.title}</td>
                      <td>
                        {review.userId.firstName} {review.userId.lastName}
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          ⭐ {review.rating}/5
                        </span>
                      </td>
                      <td
                        className="text-truncate"
                        style={{ maxWidth: "200px" }}
                      >
                        {review.review}
                      </td>
                      <td className="text-muted small">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-AU",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-info text-white me-2"
                          onClick={() => handleViewReview(review)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>

      {/* Review Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Review Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReview && (
            <div>
              <div className="mb-3">
                <h6 className="fw-bold">Book: {selectedReview.bookId.title}</h6>
                <p className="text-muted">by {selectedReview.bookId.author}</p>
              </div>

              <div className="mb-3">
                <h6 className="fw-bold">Reviewer</h6>
                <p>
                  {selectedReview.userId.firstName}{" "}
                  {selectedReview.userId.lastName}
                </p>
                <p className="text-muted">{selectedReview.userId.email}</p>
              </div>

              <div className="mb-3">
                <h6 className="fw-bold">Rating</h6>
                <p>
                  <span className="badge bg-warning text-dark">
                    ⭐ {selectedReview.rating}/5
                  </span>
                </p>
              </div>

              <div className="mb-3">
                <h6 className="fw-bold">Review Text</h6>
                <p className="border p-3 bg-light">{selectedReview.review}</p>
              </div>

              <div className="mb-3">
                <h6 className="fw-bold">Submitted On</h6>
                <p className="text-muted">
                  {new Date(selectedReview.createdAt).toLocaleDateString(
                    "en-AU",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => handleDelete(selectedReview._id)}
          >
            Delete Review
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleReject(selectedReview._id)}
          >
            Reject
          </Button>
          <Button
            variant="success"
            onClick={() => handleApprove(selectedReview._id)}
          >
            Approve
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminReviews;
