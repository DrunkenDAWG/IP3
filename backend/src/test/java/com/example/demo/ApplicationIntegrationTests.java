package com.example.demo;

import com.example.demo.dto.AuthRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.model.Employee;
import com.example.demo.security.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ApplicationIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    @DisplayName("Login with invalid credentials should return 401 Unauthorized")
    void loginWithInvalidCredentialsShouldFail() throws Exception {
        AuthRequest wrongRequest = new AuthRequest("admin", "wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Invalid username or password")));
    }

    @Test
    @DisplayName("Login with valid admin credentials should return 200 OK with JWT")
    void loginWithValidCredentialsShouldSucceed() throws Exception {
        AuthRequest validRequest = new AuthRequest("admin", "admin123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jwtToken", notNullValue()))
                .andExpect(jsonPath("$.username", is("admin")));
    }

    @Test
    @DisplayName("Accessing /api/employees without JWT should return 401 Unauthorized")
    void accessEmployeesWithoutTokenShouldFail() throws Exception {
        mockMvc.perform(get("/api/employees"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Full CRUDL and Search lifecycle with JWT authentication")
    void fullCrudlAndSearchLifecycle() throws Exception {
        // 1. Authenticate to obtain JWT
        AuthRequest authRequest = new AuthRequest("admin", "admin123");
        MvcResult authResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                authResult.getResponse().getContentAsString(),
                AuthResponse.class
        );
        String token = "Bearer " + authResponse.getJwtToken();

        // 2. LIST all employees
        mockMvc.perform(get("/api/employees")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(10))));

        // 3. SEARCH employees by keyword
        mockMvc.perform(get("/api/employees")
                        .param("search", "Sharma")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].firstName", is("Rajesh")));

        // 4. CREATE new employee
        Employee newEmployee = new Employee("Aadhav", "Sharma", "aadhav.sharma@bharattech.in", "Legal");
        MvcResult createResult = mockMvc.perform(post("/api/employees")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newEmployee)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.email", is("aadhav.sharma@bharattech.in")))
                .andReturn();

        Employee created = objectMapper.readValue(
                createResult.getResponse().getContentAsString(),
                Employee.class
        );

        // 5. READ single employee by ID
        mockMvc.perform(get("/api/employees/" + created.getId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName", is("Aadhav")))
                .andExpect(jsonPath("$.department", is("Legal")));

        // 6. UPDATE employee
        created.setDepartment("Executive Board");
        mockMvc.perform(put("/api/employees/" + created.getId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(created)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.department", is("Executive Board")));

        // 7. DELETE employee
        mockMvc.perform(delete("/api/employees/" + created.getId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 8. Confirm deletion
        mockMvc.perform(get("/api/employees/" + created.getId())
                        .header("Authorization", token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Create and Update should trim fields and enforce case-insensitive email uniqueness")
    void emailUniquenessShouldBeCaseInsensitiveAndTrimmed() throws Exception {
        AuthRequest authRequest = new AuthRequest("admin", "admin123");
        MvcResult authResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                authResult.getResponse().getContentAsString(),
                AuthResponse.class
        );
        String token = "Bearer " + authResponse.getJwtToken();

        // Attempt to create employee with uppercase variant of existing email (rajesh.sharma@bharattech.in)
        Employee duplicateEmailEmp = new Employee("Rajesh", "Duplicate", "RAJESH.SHARMA@BHARATTECH.IN", "Engineering");
        mockMvc.perform(post("/api/employees")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateEmailEmp)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("Stale JWT for non-existent user should not throw unhandled exception")
    void staleJwtForDeletedUserShouldReturnUnauthorized() throws Exception {
        String staleToken = "Bearer " + jwtUtil.generateToken("deleted_user");

        mockMvc.perform(get("/api/employees")
                        .header("Authorization", staleToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Pagination, Stats, Bulk Status and CSV Export should work with JWT")
    void paginationStatsAndBulkOperationsShouldSucceed() throws Exception {
        AuthRequest authRequest = new AuthRequest("admin", "admin123");
        MvcResult authResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                authResult.getResponse().getContentAsString(),
                AuthResponse.class
        );
        String token = "Bearer " + authResponse.getJwtToken();

        // 1. Pagination
        mockMvc.perform(get("/api/employees")
                        .param("page", "0")
                        .param("size", "5")
                        .param("sortBy", "firstName")
                        .param("sortDir", "asc")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(10)));

        // 2. Stats
        mockMvc.perform(get("/api/employees/stats")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalHeadcount", greaterThanOrEqualTo(10)))
                .andExpect(jsonPath("$.departmentBreakdown", notNullValue()));

        // 3. CSV Export
        mockMvc.perform(get("/api/employees/export")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/csv"))
                .andExpect(content().string(containsString("ID,First Name,Last Name,Email")));
    }
}
