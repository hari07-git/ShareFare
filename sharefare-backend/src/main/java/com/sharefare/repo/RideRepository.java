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
      select r from Ride r join r.driver d
      where r.status in :statuses
        and (:origin is null or lower(r.origin) like lower(concat('%', cast(:origin as string), '%')))
        and (:destination is null or lower(r.destination) like lower(concat('%', cast(:destination as string), '%')))
        and (cast(:from as timestamp) is null or r.departureTime >= :from)
        and (cast(:to as timestamp) is null or r.departureTime < :to)
        and (:femaleOnly = false or d.gender = 'FEMALE')
        and (:verifiedOnly = false or d.verifiedStudent = true)
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
