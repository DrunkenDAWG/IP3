package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.BulkDeleteRequest;
import com.example.demo.dto.BulkStatusRequest;
import com.example.demo.dto.EmployeeStatsResponse;
import com.example.demo.model.Employee;
import com.example.demo.model.EmployeeStatus;
import com.example.demo.model.EmploymentType;
import com.example.demo.service.EmployeeService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * GET /api/employees: Retrieve paginated or full filtered list.
     */
    @GetMapping
    public ResponseEntity<?> getEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(required = false) EmploymentType employmentType,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir
    ) {
        if (page != null && size != null) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
            String validatedSortBy = isValidSortField(sortBy) ? sortBy : "id";
            Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, validatedSortBy));

            Page<Employee> employeePage = employeeService.getEmployeesPaged(search, department, status, employmentType, pageable);
            return ResponseEntity.ok(employeePage);
        }

        List<Employee> list = employeeService.getFilteredList(search, department, status, employmentType);
        return ResponseEntity.ok(list);
    }

    /**
     * GET /api/employees/{id}: Retrieve a single employee by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(employee);
    }

    /**
     * GET /api/employees/stats: Retrieve enterprise workforce metrics.
     */
    @GetMapping("/stats")
    public ResponseEntity<EmployeeStatsResponse> getEmployeeStats() {
        EmployeeStatsResponse stats = employeeService.getEmployeeStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/employees/departments: Get distinct departments list.
     */
    @GetMapping("/departments")
    public ResponseEntity<List<String>> getDistinctDepartments() {
        return ResponseEntity.ok(employeeService.getDistinctDepartments());
    }

    /**
     * GET /api/employees/export: Stream RFC-4180 CSV export.
     */
    @GetMapping("/export")
    public void exportEmployeesCsv(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(required = false) EmploymentType employmentType,
            HttpServletResponse response
    ) throws IOException {
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"workforce-directory.csv\"");
        employeeService.exportToCsv(search, department, status, employmentType, response.getWriter());
    }

    /**
     * POST /api/employees: Create a new employee record.
     */
    @PostMapping
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody Employee employee) {
        Employee createdEmployee = employeeService.createEmployee(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEmployee);
    }

    /**
     * PUT /api/employees/{id}: Update an existing employee record.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody Employee employeeDetails) {
        Employee updatedEmployee = employeeService.updateEmployee(id, employeeDetails);
        return ResponseEntity.ok(updatedEmployee);
    }

    /**
     * DELETE /api/employees/{id}: Delete an employee record.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(new ApiResponse(true, "Employee deleted successfully with id: " + id));
    }

    /**
     * DELETE /api/employees/bulk: Bulk delete employee records.
     */
    @DeleteMapping("/bulk")
    public ResponseEntity<ApiResponse> bulkDeleteEmployees(@Valid @RequestBody BulkDeleteRequest request) {
        employeeService.bulkDelete(request.getIds());
        return ResponseEntity.ok(new ApiResponse(true, "Successfully deleted " + request.getIds().size() + " employee records"));
    }

    /**
     * PATCH /api/employees/bulk-status: Bulk update employment status.
     */
    @PatchMapping("/bulk-status")
    public ResponseEntity<ApiResponse> bulkUpdateStatus(@Valid @RequestBody BulkStatusRequest request) {
        int updated = employeeService.bulkUpdateStatus(request.getIds(), request.getStatus());
        return ResponseEntity.ok(new ApiResponse(true, "Successfully updated status for " + updated + " records to " + request.getStatus()));
    }

    private boolean isValidSortField(String field) {
        return List.of("id", "firstName", "lastName", "email", "department", "jobTitle", "location", "startDate", "status", "salary")
                .contains(field);
    }
}
