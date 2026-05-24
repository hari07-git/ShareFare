package com.sharefare.service;

import com.sharefare.dto.ReviewDtos.CreateReviewRequest;
import com.sharefare.dto.ReviewDtos.ReviewResponse;
import com.sharefare.exception.ApiException;
import com.sharefare.model.BookingStatus;
import com.sharefare.model.Review;
import com.sharefare.model.User;
import com.sharefare.repo.BookingRepository;
import com.sharefare.repo.ReviewRepository;
import com.sharefare.repo.RideRepository;
import com.sharefare.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {
  private final RideRepository rideRepository;
  private final UserRepository userRepository;
  private final BookingRepository bookingRepository;
  private final ReviewRepository reviewRepository;

  public ReviewService(RideRepository rideRepository,
                       UserRepository userRepository,
                       BookingRepository bookingRepository,
                       ReviewRepository reviewRepository) {
    this.rideRepository = rideRepository;
    this.userRepository = userRepository;
    this.bookingRepository = bookingRepository;
    this.reviewRepository = reviewRepository;
  }

  @Transactional
  public ReviewResponse createReview(Long rideId, String reviewerEmail, CreateReviewRequest request) {
    var reviewer = userRepository.findByEmailIgnoreCase(reviewerEmail)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    var ride = rideRepository.findById(rideId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ride not found"));
    var reviewee = userRepository.findByEmailIgnoreCase(request.revieweeEmail())
        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Reviewee not found"));

    boolean reviewerIsDriver = ride.getDriver().getId().equals(reviewer.getId());
    boolean reviewerIsPassenger = bookingRepository.findByPassengerOrderByCreatedAtDesc(reviewer).stream()
        .anyMatch(b -> b.getRide().getId().equals(rideId) && b.getStatus() == BookingStatus.COMPLETED);

    if (!reviewerIsDriver && !reviewerIsPassenger) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Only ride participants can review");
    }

    boolean revieweeIsDriver = ride.getDriver().getId().equals(reviewee.getId());
    boolean revieweeIsPassenger = bookingRepository.findByPassengerOrderByCreatedAtDesc(reviewee).stream()
        .anyMatch(b -> b.getRide().getId().equals(rideId) && b.getStatus() == BookingStatus.COMPLETED);

    if (!revieweeIsDriver && !revieweeIsPassenger) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Reviewee must be a ride participant");
    }

    if (reviewer.getId().equals(reviewee.getId())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot review yourself");
    }

    Review review = new Review();
    review.setRide(ride);
    review.setReviewer(reviewer);
    review.setReviewee(reviewee);
    review.setRating(request.rating());
    review.setComment(request.comment());
    Review saved = reviewRepository.save(review);

    // Dynamic trust score recalculation
    List<Review> userReviews = reviewRepository.findByRevieweeOrderByCreatedAtDesc(reviewee);
    double averageRating = 5.0; // Default base rating if none found
    if (!userReviews.isEmpty()) {
      double sum = 0.0;
      for (Review r : userReviews) {
        sum += r.getRating();
      }
      averageRating = sum / userReviews.size();
    }

    // Trust score mapping: base score = averageRating * 2.0 (out of 10.0)
    double calculatedScore = averageRating * 2.0;

    // Apply bonuses
    if (reviewee.isCollegeVerified()) {
      calculatedScore += 1.5; // ID verified bonus
    }
    if (reviewee.isEmailVerified()) {
      calculatedScore += 0.5; // Email verified bonus
    }

    // Cap the score at 10.0 (maximum trust)
    if (calculatedScore > 10.0) {
      calculatedScore = 10.0;
    }

    reviewee.setTrustScore(calculatedScore);
    userRepository.save(reviewee);

    return toResponse(saved);
  }

  @Transactional(readOnly = true)
  public List<ReviewResponse> listRideReviews(Long rideId) {
    var ride = rideRepository.findById(rideId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ride not found"));
    return reviewRepository.findByRideOrderByCreatedAtDesc(ride).stream().map(this::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public List<ReviewResponse> listUserReviews(String email) {
    var user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    return reviewRepository.findByRevieweeOrderByCreatedAtDesc(user).stream().map(this::toResponse).toList();
  }

  private ReviewResponse toResponse(Review r) {
    return new ReviewResponse(
        r.getId(),
        r.getRide().getId(),
        r.getReviewer().getEmail(),
        r.getReviewee().getEmail(),
        r.getRating(),
        r.getComment(),
        r.getCreatedAt()
    );
  }
}
