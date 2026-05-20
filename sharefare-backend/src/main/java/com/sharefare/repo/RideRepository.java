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
import java.util.List;
import java.util.Optional;

public interface RideRepository extends JpaRepository<Ride, Long> {

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select r from Ride r where r.id = :id")
  Optional<Ride> findForUpdate(@Param("id") Long id);

  @Query("""
      select r from Ride r
      where r.status in :statuses
        and (:origin is null or lower(r.origin) like lower(concat('%', :origin, '%')))
        and (:destination is null or lower(r.destination) like lower(concat('%', :destination, '%')))
        and (:from is null or r.departureTime >= :from)
        and (:to is null or r.departureTime < :to)
        and (:femaleOnly = false or r.driver.gender = 'FEMALE')
        and (:verifiedOnly = false or r.driver.verifiedStudent = true)
        order by r.departureTime asc""")
  Page<Ride> search(@Param("origin") String origin,
                    @Param("destination") String destination,
                    @Param("from") OffsetDateTime from,
                    @Param("to") OffsetDateTime to,
                    @Param("statuses") Iterable<RideStatus> statuses,
                    @Param("femaleOnly") boolean femaleOnly,
                    @Param("verifiedOnly") boolean verifiedOnly,
                    Pageable pageable);

  long countByStatus(RideStatus status);

  List<Ride> findTop10ByOrderByDepartureTimeDesc();
}
