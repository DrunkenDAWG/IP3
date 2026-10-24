import React from 'react';
import {
  BarChart3,
  MapPin,
  IndianRupee,
  Briefcase,
  Download,
  Users,
  Building2,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
  PieChart
} from 'lucide-react';

export default function AnalyticsView({
  employees = [],
  departments = [],
  stats = null,
  onExportCsv,
  formatSalary,
}) {
  const totalEmployees = employees.length || 1;

  // 1. Geographic Breakdown across Indian Tech Hubs
  const locationStats = React.useMemo(() => {
    const locMap = {};
    employees.forEach((emp) => {
      const loc = (emp.location || 'Remote').trim();
      locMap[loc] = (locMap[loc] || 0) + 1;
    });

    return Object.entries(locMap)
      .map(([location, count]) => ({
        location,
        count,
        percentage: Math.round((count / totalEmployees) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [employees, totalEmployees]);

  // 2. Compensation & CTC Tier Analysis
  const compensationStats = React.useMemo(() => {
    const salaries = employees
      .map((e) => Number(e.salary))
      .filter((s) => !isNaN(s) && s > 0)
      .sort((a, b) => a - b);

    const totalPayroll = salaries.reduce((sum, s) => sum + s, 0);
    const avgSalary = salaries.length > 0 ? Math.round(totalPayroll / salaries.length) : 0;
    const medianSalary = salaries.length > 0 ? salaries[Math.floor(salaries.length / 2)] : 0;
    const minSalary = salaries.length > 0 ? salaries[0] : 0;
    const maxSalary = salaries.length > 0 ? salaries[salaries.length - 1] : 0;

    // CTC Bands
    const bands = [
      { label: 'Executive & Staff (> ₹40 LPA)', min: 4000000, max: Infinity, color: '#6366f1' },
      { label: 'Senior Tier (₹25L – ₹40 LPA)', min: 2500000, max: 4000000, color: '#0ea5e9' },
      { label: 'Mid-Level Tier (₹15L – ₹25 LPA)', min: 1500000, max: 2500000, color: '#10b981' },
      { label: 'Associate / Foundation (< ₹15 LPA)', min: 0, max: 1500000, color: '#f59e0b' },
    ];

    const bandData = bands.map((band) => {
      const inBand = salaries.filter((s) => s >= band.min && s < band.max);
      return {
        ...band,
        count: inBand.length,
        percentage: Math.round((inBand.length / totalEmployees) * 100),
      };
    });

    return {
      totalPayroll,
      avgSalary,
      medianSalary,
      minSalary,
      maxSalary,
      bandData,
    };
  }, [employees, totalEmployees]);

  // 3. Employment Type Breakdown
  const typeStats = React.useMemo(() => {
    const typeMap = {};
    employees.forEach((emp) => {
      const type = (emp.employmentType || 'FULL_TIME').replace('_', ' ');
      typeMap[type] = (typeMap[type] || 0) + 1;
    });

    return Object.entries(typeMap).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalEmployees) * 100),
    }));
  }, [employees, totalEmployees]);

  // Format Crores
  const formatCroresOrLakhs = (val) => {
    if (!val) return '₹0';
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  // Export Department Payroll Breakdown CSV
  const handleExportDeptPayrollCsv = () => {
    const deptRows = departments.map((deptName) => {
      const deptMembers = employees.filter((e) => e.department?.toLowerCase() === deptName.toLowerCase());
      const salaries = deptMembers.map((e) => Number(e.salary)).filter((s) => !isNaN(s) && s > 0);
      const totalPayroll = salaries.reduce((sum, s) => sum + s, 0);
      const avgSalary = salaries.length > 0 ? Math.round(totalPayroll / salaries.length) : 0;
      return `"${deptName}",${deptMembers.length},${totalPayroll},${avgSalary}`;
    });

    const csvContent = "Department,Headcount,Total Payroll (INR),Average CTC (INR)\n" + deptRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bharattech-dept-payroll-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="analytics-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Workforce Analytics & Export Center
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Executive compensation intelligence, Pan-India geographic footprint, and compliance reports.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={onExportCsv}>
          <Download size={15} />
          <span>Export Master CSV Report</span>
        </button>
      </div>

      {/* Top Level Summary Cards */}
      <section className="metrics-row">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Cumulative Annual Payroll</span>
            <div className="metric-icon-wrap">
              <IndianRupee size={16} style={{ color: 'var(--status-active-dot)' }} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{formatCroresOrLakhs(compensationStats.totalPayroll)}</span>
            <span className="metric-subtext">Total Company CTC</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Average Annual CTC</span>
            <div className="metric-icon-wrap">
              <TrendingUp size={16} style={{ color: '#0ea5e9' }} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">
              {compensationStats.avgSalary ? `${(compensationStats.avgSalary / 100000).toFixed(1)} LPA` : '—'}
            </span>
            <span className="metric-subtext">Per Team Member</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Median Annual CTC</span>
            <div className="metric-icon-wrap">
              <BarChart3 size={16} style={{ color: '#6366f1' }} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">
              {compensationStats.medianSalary ? `${(compensationStats.medianSalary / 100000).toFixed(1)} LPA` : '—'}
            </span>
            <span className="metric-subtext">50th Percentile</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Pan-India Tech Hubs</span>
            <div className="metric-icon-wrap">
              <MapPin size={16} style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{locationStats.length}</span>
            <span className="metric-subtext">Cities & Remote</span>
          </div>
        </div>
      </section>

      {/* 2-Column Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Pan-India Geographic Distribution */}
        <div
          className="metric-card"
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <MapPin size={18} style={{ color: '#0ea5e9' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Pan-India Geographic Footprint
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Headcount distribution across Indian metro clusters and tech cities
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {locationStats.map((loc) => (
              <div key={loc.location}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{loc.location}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    <strong>{loc.count}</strong> members ({loc.percentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${loc.percentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #0ea5e9 0%, #6366f1 100%)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compensation & CTC Band Intelligence */}
        <div
          className="metric-card"
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <IndianRupee size={18} style={{ color: 'var(--status-active-dot)' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Annual Compensation (CTC) Tiers
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Workforce compensation breakdown in Lakhs Per Annum (LPA)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {compensationStats.bandData.map((band) => (
              <div key={band.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{band.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    <strong>{band.count}</strong> ({band.percentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${band.percentage}%`,
                      height: '100%',
                      backgroundColor: band.color,
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats Grid */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Peak CTC Recorded</span>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block' }}>
                {compensationStats.maxSalary ? `${(compensationStats.maxSalary / 100000).toFixed(1)} LPA` : '—'}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Entry / Foundation CTC</span>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block' }}>
                {compensationStats.minSalary ? `${(compensationStats.minSalary / 100000).toFixed(1)} LPA` : '—'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Export & Compliance Center */}
      <div
        className="metric-card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FileSpreadsheet size={18} style={{ color: '#10b981' }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Data Export & Compliance Suite
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Generate on-demand RFC-4180 CSV exports for audit, payroll reconciliation, and statutory filing.
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Master Workforce Directory CSV
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Full employee register including Indian contact details, PAN India hubs, departments, and annual CTC.
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={onExportCsv} style={{ width: 'fit-content' }}>
              <Download size={13} />
              <span>Download Master CSV</span>
            </button>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Department Payroll Breakdown CSV
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Summary of headcount, cumulative CTC budget, and average compensation by department.
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleExportDeptPayrollCsv} style={{ width: 'fit-content' }}>
              <Download size={13} />
              <span>Download Dept Payroll CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
