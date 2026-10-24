package com.example.demo.service;

import com.example.demo.dto.EmployeeStatsResponse;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Employee;
import com.example.demo.model.EmployeeStatus;
import com.example.demo.model.EmploymentType;
import com.example.demo.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintWriter;
import java.io.Writer;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    /**
     * Retrieve paginated employees with multi-criteria filtering.
     */
    @Transactional(readOnly = true)
    public Page<Employee> getEmployeesPaged(String search, String department, EmployeeStatus status,
                                            EmploymentType employmentType, Pageable pageable) {
        String sanitizedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String sanitizedDept = (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("ALL"))
                ? department.trim() : null;

        return employeeRepository.findWithFilters(sanitizedSearch, sanitizedDept, status, employmentType, pageable);
    }

    /**
     * Retrieve all employees or filter by search query (backward-compatible).
     */
    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return employeeRepository.searchEmployees(search.trim());
        }
        return employeeRepository.findAll();
    }

    /**
     * Retrieve filtered list of employees (for CSV export or reports).
     */
    @Transactional(readOnly = true)
    public List<Employee> getFilteredList(String search, String department, EmployeeStatus status,
                                          EmploymentType employmentType) {
        String sanitizedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String sanitizedDept = (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("ALL"))
                ? department.trim() : null;

        return employeeRepository.findAllWithFilters(sanitizedSearch, sanitizedDept, status, employmentType);
    }

    /**
     * Retrieve an employee by ID.
     */
    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    /**
     * Create a new employee record with all enterprise fields.
     */
    @Transactional
    public Employee createEmployee(Employee employee) {
        String normalizedEmail = employee.getEmail().trim().toLowerCase();
        if (employeeRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("Employee with email '" + normalizedEmail + "' already exists");
        }

        employee.setFirstName(employee.getFirstName().trim());
        employee.setLastName(employee.getLastName().trim());
        employee.setEmail(normalizedEmail);
        employee.setDepartment(employee.getDepartment().trim());

        if (employee.getJobTitle() != null) {
            employee.setJobTitle(employee.getJobTitle().trim());
        }
        if (employee.getPhone() != null) {
            employee.setPhone(employee.getPhone().trim());
        }
        if (employee.getLocation() != null) {
            employee.setLocation(employee.getLocation().trim());
        }
        if (employee.getEmploymentType() == null) {
            employee.setEmploymentType(EmploymentType.FULL_TIME);
        }
        if (employee.getStatus() == null) {
            employee.setStatus(EmployeeStatus.ACTIVE);
        }
        if (employee.getStartDate() == null) {
            employee.setStartDate(LocalDate.now());
        }

        return employeeRepository.save(employee);
    }

    /**
     * Update an existing employee record.
     */
    @Transactional
    public Employee updateEmployee(Long id, Employee employeeDetails) {
        Employee existingEmployee = getEmployeeById(id);

        String normalizedEmail = employeeDetails.getEmail().trim().toLowerCase();
        if (employeeRepository.existsByEmailIgnoreCaseAndIdNot(normalizedEmail, id)) {
            throw new BadRequestException("Email '" + normalizedEmail + "' is already in use by another employee");
        }

        existingEmployee.setFirstName(employeeDetails.getFirstName().trim());
        existingEmployee.setLastName(employeeDetails.getLastName().trim());
        existingEmployee.setEmail(normalizedEmail);
        existingEmployee.setDepartment(employeeDetails.getDepartment().trim());

        if (employeeDetails.getJobTitle() != null) {
            existingEmployee.setJobTitle(employeeDetails.getJobTitle().trim());
        }
        if (employeeDetails.getPhone() != null) {
            existingEmployee.setPhone(employeeDetails.getPhone().trim());
        }
        if (employeeDetails.getLocation() != null) {
            existingEmployee.setLocation(employeeDetails.getLocation().trim());
        }
        if (employeeDetails.getEmploymentType() != null) {
            existingEmployee.setEmploymentType(employeeDetails.getEmploymentType());
        }
        if (employeeDetails.getStatus() != null) {
            existingEmployee.setStatus(employeeDetails.getStatus());
        }
        if (employeeDetails.getStartDate() != null) {
            existingEmployee.setStartDate(employeeDetails.getStartDate());
        }
        existingEmployee.setSalary(employeeDetails.getSalary());

        return employeeRepository.save(existingEmployee);
    }

    /**
     * Delete an employee record by ID.
     */
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employeeRepository.delete(employee);
    }

    /**
     * Bulk delete employees by list of IDs.
     */
    @Transactional
    public void bulkDelete(List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            employeeRepository.deleteByIdIn(ids);
        }
    }

    /**
     * Bulk update status for a list of employee IDs.
     */
    @Transactional
    public int bulkUpdateStatus(List<Long> ids, EmployeeStatus status) {
        if (ids == null || ids.isEmpty() || status == null) {
            return 0;
        }
        return employeeRepository.updateStatusByIdIn(ids, status);
    }

    /**
     * Compute workforce executive statistics.
     */
    @Transactional(readOnly = true)
    public EmployeeStatsResponse getEmployeeStats() {
        long total = employeeRepository.count();
        long active = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long onboarding = employeeRepository.countByStatus(EmployeeStatus.ONBOARDING);
        long onLeave = employeeRepository.countByStatus(EmployeeStatus.ON_LEAVE);
        long newHires90Days = employeeRepository.countByStartDateAfter(LocalDate.now().minusDays(90));

        Map<String, Long> deptMap = new LinkedHashMap<>();
        List<Object[]> deptCounts = employeeRepository.countEmployeesByDepartment();
        for (Object[] row : deptCounts) {
            String dept = (String) row[0];
            Long count = (Long) row[1];
            deptMap.put(dept, count);
        }

        return new EmployeeStatsResponse(total, active, onboarding, onLeave, newHires90Days, deptMap);
    }

    /**
     * Get distinct department names for filtering.
     */
    @Transactional(readOnly = true)
    public List<String> getDistinctDepartments() {
        return employeeRepository.findDistinctDepartments();
    }

    /**
     * Export employees to CSV format.
     */
    @Transactional(readOnly = true)
    public void exportToCsv(String search, String department, EmployeeStatus status,
                            EmploymentType employmentType, Writer writer) {
        List<Employee> employees = getFilteredList(search, department, status, employmentType);
        PrintWriter pw = new PrintWriter(writer);

        // Header
        pw.println("ID,First Name,Last Name,Email,Phone,Job Title,Department,Employment Type,Status,Location (City/State),Start Date,Annual CTC (INR)");

        for (Employee emp : employees) {
            pw.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                    emp.getId(),
                    escapeCsv(emp.getFirstName()),
                    escapeCsv(emp.getLastName()),
                    escapeCsv(emp.getEmail()),
                    escapeCsv(emp.getPhone() != null ? emp.getPhone() : ""),
                    escapeCsv(emp.getJobTitle() != null ? emp.getJobTitle() : ""),
                    escapeCsv(emp.getDepartment()),
                    emp.getEmploymentType() != null ? emp.getEmploymentType().name() : "",
                    emp.getStatus() != null ? emp.getStatus().name() : "",
                    escapeCsv(emp.getLocation() != null ? emp.getLocation() : ""),
                    emp.getStartDate() != null ? emp.getStartDate().toString() : "",
                    emp.getSalary() != null ? emp.getSalary().toString() : ""
            );
        }
        pw.flush();
    }

    private String escapeCsv(String input) {
        if (input == null) return "";
        return input.replace("\"", "\"\"");
    }
}
