package com.sharefare.repo;

import com.sharefare.model.Ride;
import com.sharefare.model.RideStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RideRepository extends JpaRepository<Ride, Long> {

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select r from Ride r where r.id = :id")
  Optional<Ride> findForUpdate(@Param("id") Long id);

  @Query(value = """
      SELECT r.* FROM rides r
      JOIN users d ON d.id = r.driver_id
      WHERE r.status IN (:statuses)
        AND (:origin IS NULL OR lower(r.origin) LIKE lower('%' || CAST(:origin AS TEXT) || '%'))
        AND (:destination IS NULL OR lower(r.destination) LIKE lower('%' || CAST(:destination AS TEXT) || '%'))
        AND (CAST(:from AS TIMESTAMP WITH TIME ZONE) IS NULL OR r.departure_time >= CAST(:from AS TIMESTAMP WITH TIME ZONE))
        AND (CAST(:to AS TIMESTAMP WITH TIME ZONE) IS NULL OR r.departure_time < CAST(:to AS TIMESTAMP WITH TIME ZONE))
        AND (:femaleOnly = FALSE OR d.gender = 'FEMALE')
        AND (:verifiedOnly = FALSE OR d.verified_student = TRUE)
      ORDER BY r.departure_time ASC
      """,
      countQuery = """
      SELECT COUNT(*) FROM rides r
      JOIN users d ON d.id = r.driver_id
      WHERE r.status IN (:statuses)
        AND (:origin IS NULL OR lower(r.origin) LIKE lower('%' || CAST(:origin AS TEXT) || '%'))
        AND (:destination IS NULL OR lower(r.destination) LIKE lower('%' || CAST(:destination AS TEXT) || '%'))
        AND (CAST(:from AS TIMESTAMP WITH TIME ZONE) IS NULL OR r.departure_time >= CAST(:from AS TIMESTAMP WITH TIME ZONE))
        AND (CAST(:to AS TIMESTAMP WITH TIME ZONE) IS NULL OR r.departure_time < CAST(:to AS TIMESTAMP WITH TIME ZONE))
        AND (:femaleOnly = FALSE OR d.gender = 'FEMALE')
        AND (:verifiedOnly = FALSE OR d.verified_student = TRUE)
      """,
      nativeQuery = true)
  Page<Ride> search(@Param("origin") String origin,
                    @Param("destination") String destination,
                    @Param("from") OffsetDateTime from,
                    @Param("to") OffsetDateTime to,
                    @Param("statuses") Collection<String> statuses,
                    @Param("femaleOnly") boolean femaleOnly,
                    @Param("verifiedOnly") boolean verifiedOnly,
                    Pageable pageable);

  long countByStatus(RideStatus status);

  List<Ride> findTop10ByOrderByDepartureTimeDesc();
}
