package com.example.demo.dto;

import java.util.Map;

public class EmployeeStatsResponse {

    private long totalHeadcount;
    private long activeCount;
    private long onboardingCount;
    private long onLeaveCount;
    private long newHiresLast90Days;
    private Map<String, Long> departmentBreakdown;

    public EmployeeStatsResponse() {
    }

    public EmployeeStatsResponse(long totalHeadcount, long activeCount, long onboardingCount,
                                 long onLeaveCount, long newHiresLast90Days,
                                 Map<String, Long> departmentBreakdown) {
        this.totalHeadcount = totalHeadcount;
        this.activeCount = activeCount;
        this.onboardingCount = onboardingCount;
        this.onLeaveCount = onLeaveCount;
        this.newHiresLast90Days = newHiresLast90Days;
        this.departmentBreakdown = departmentBreakdown;
    }

    public long getTotalHeadcount() {
        return totalHeadcount;
    }

    public void setTotalHeadcount(long totalHeadcount) {
        this.totalHeadcount = totalHeadcount;
    }

    public long getActiveCount() {
        return activeCount;
    }

    public void setActiveCount(long activeCount) {
        this.activeCount = activeCount;
    }

    public long getOnboardingCount() {
        return onboardingCount;
    }

    public void setOnboardingCount(long onboardingCount) {
        this.onboardingCount = onboardingCount;
    }

    public long getOnLeaveCount() {
        return onLeaveCount;
    }

    public void setOnLeaveCount(long onLeaveCount) {
        this.onLeaveCount = onLeaveCount;
    }

    public long getNewHiresLast90Days() {
        return newHiresLast90Days;
    }

    public void setNewHiresLast90Days(long newHiresLast90Days) {
        this.newHiresLast90Days = newHiresLast90Days;
    }

    public Map<String, Long> getDepartmentBreakdown() {
        return departmentBreakdown;
    }

    public void setDepartmentBreakdown(Map<String, Long> departmentBreakdown) {
        this.departmentBreakdown = departmentBreakdown;
    }
}
