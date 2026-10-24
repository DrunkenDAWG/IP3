package com.example.demo.dto;

import com.example.demo.model.EmployeeStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class BulkStatusRequest {

    @NotEmpty(message = "List of IDs cannot be empty")
    private List<Long> ids;

    @NotNull(message = "Target status is required")
    private EmployeeStatus status;

    public BulkStatusRequest() {
    }

    public BulkStatusRequest(List<Long> ids, EmployeeStatus status) {
        this.ids = ids;
        this.status = status;
    }

    public List<Long> getIds() {
        return ids;
    }

    public void setIds(List<Long> ids) {
        this.ids = ids;
    }

    public EmployeeStatus getStatus() {
        return status;
    }

    public void setStatus(EmployeeStatus status) {
        this.status = status;
    }
}
