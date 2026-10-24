package com.example.demo.repository;

import com.example.demo.model.Employee;
import com.example.demo.model.EmployeeStatus;
import com.example.demo.model.EmploymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query("SELECT e FROM Employee e WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.department) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(COALESCE(e.jobTitle, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(COALESCE(e.location, '')) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:department IS NULL OR :department = '' OR :department = 'ALL' OR LOWER(e.department) = LOWER(:department)) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:employmentType IS NULL OR e.employmentType = :employmentType)")
    Page<Employee> findWithFilters(
            @Param("search") String search,
            @Param("department") String department,
            @Param("status") EmployeeStatus status,
            @Param("employmentType") EmploymentType employmentType,
            Pageable pageable
    );

    @Query("SELECT e FROM Employee e WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.department) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(COALESCE(e.jobTitle, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(COALESCE(e.location, '')) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:department IS NULL OR :department = '' OR :department = 'ALL' OR LOWER(e.department) = LOWER(:department)) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:employmentType IS NULL OR e.employmentType = :employmentType) " +
           "ORDER BY e.id ASC")
    List<Employee> findAllWithFilters(
            @Param("search") String search,
            @Param("department") String department,
            @Param("status") EmployeeStatus status,
            @Param("employmentType") EmploymentType employmentType
    );

    /**
     * Backward-compatible simple keyword search
     */
    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.department) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY e.id ASC")
    List<Employee> searchEmployees(@Param("keyword") String keyword);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    long countByStatus(EmployeeStatus status);

    long countByStartDateAfter(LocalDate date);

    @Query("SELECT e.department, COUNT(e) FROM Employee e GROUP BY e.department ORDER BY COUNT(e) DESC")
    List<Object[]> countEmployeesByDepartment();

    @Query("SELECT DISTINCT e.department FROM Employee e ORDER BY e.department ASC")
    List<String> findDistinctDepartments();

    void deleteByIdIn(List<Long> ids);

    @Modifying
    @Query("UPDATE Employee e SET e.status = :status WHERE e.id IN :ids")
    int updateStatusByIdIn(@Param("ids") List<Long> ids, @Param("status") EmployeeStatus status);
}
