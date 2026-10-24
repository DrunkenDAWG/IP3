import React from 'react';
import { Building2, Users, IndianRupee, ArrowRight, TrendingUp, Sparkles, Plus, Briefcase } from 'lucide-react';
import { getAvatarStyle } from '../avatarUtils';

export default function DepartmentsView({
  employees = [],
  departments = [],
  onSelectDepartment,
  onAddMember,
  formatSalary
}) {
  // Aggregate department statistics
  const deptStats = React.useMemo(() => {
    const totalEmployees = employees.length || 1;

    return departments.map((deptName) => {
      const deptMembers = employees.filter((e) => e.department?.toLowerCase() === deptName.toLowerCase());
      const headcount = deptMembers.length;
      const percentage = Math.round((headcount / totalEmployees) * 100);
      const activeCount = deptMembers.filter((e) => e.status === 'ACTIVE').length;
      const onboardingCount = deptMembers.filter((e) => e.status === 'ONBOARDING').length;

      const salaries = deptMembers.map((e) => Number(e.salary)).filter((s) => !isNaN(s) && s > 0);
      const totalPayroll = salaries.reduce((sum, s) => sum + s, 0);
      const avgSalary = salaries.length > 0 ? Math.round(totalPayroll / salaries.length) : 0;

      // Identify department lead or senior member
      const lead = deptMembers.find((e) =>
        /principal|lead|head|director|manager|architect|senior/i.test(e.jobTitle || '')
      ) || deptMembers[0] || null;

      // Extract top titles
      const uniqueTitles = Array.from(new Set(deptMembers.map((e) => e.jobTitle).filter(Boolean))).slice(0, 3);

      return {
        name: deptName,
        members: deptMembers,
        headcount,
        percentage,
        activeCount,
        onboardingCount,
        totalPayroll,
        avgSalary,
        lead,
        titles: uniqueTitles,
      };
    }).sort((a, b) => b.headcount - a.headcount);
  }, [departments, employees]);

  // Overall company metrics
  const totalPayrollAll = deptStats.reduce((sum, d) => sum + d.totalPayroll, 0);
  const avgPayrollDept = deptStats.length > 0 ? Math.round(totalPayrollAll / deptStats.length) : 0;
  const largestDept = deptStats[0];

  const formatCroresOrLakhs = (val) => {
    if (!val) return '₹0';
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="departments-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Executive Header Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Departments & Functional Units
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Organizational structure, headcount distribution, and functional spend across {departments.length} teams.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => onAddMember()}>
          <Plus size={15} />
          <span>Add Member to Department</span>
        </button>
      </div>

      {/* Top High-level Metric Strip */}
      <section className="metrics-row">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Active Departments</span>
            <div className="metric-icon-wrap">
              <Building2 size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{deptStats.length}</span>
            <span className="metric-subtext">Business Units</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Annual Payroll</span>
            <div className="metric-icon-wrap">
              <IndianRupee size={16} style={{ color: 'var(--status-active-dot)' }} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{formatCroresOrLakhs(totalPayrollAll)}</span>
            <span className="metric-subtext">Cumulative CTC</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Largest Department</span>
            <div className="metric-icon-wrap">
              <Users size={16} style={{ color: '#6366f1' }} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{largestDept ? largestDept.name : '—'}</span>
            <span className="metric-subtext">
              {largestDept ? `${largestDept.headcount} members (${largestDept.percentage}%)` : ''}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Avg Dept Payroll</span>
            <div className="metric-icon-wrap">
              <TrendingUp size={16} style={{ color: '#0ea5e9' }} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{formatCroresOrLakhs(avgPayrollDept)}</span>
            <span className="metric-subtext">Per Functional Unit</span>
          </div>
        </div>
      </section>

      {/* Department Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {deptStats.map((dept) => (
          <div
            key={dept.name}
            className="metric-card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {dept.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {dept.headcount} team member{dept.headcount !== 1 ? 's' : ''} · {dept.percentage}% of company
                    </span>
                  </div>
                </div>

                {dept.onboardingCount > 0 && (
                  <span
                    className="status-pill status-ONBOARDING"
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                    title={`${dept.onboardingCount} member(s) onboarding`}
                  >
                    <Sparkles size={11} /> {dept.onboardingCount} onboarding
                  </span>
                )}
              </div>

              {/* Progress Headcount Bar */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  <span>Headcount Share</span>
                  <span style={{ fontWeight: 600 }}>{dept.percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(dept.percentage, 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>

              {/* Compensation Insights */}
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Total Dept Spend</span>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {formatCroresOrLakhs(dept.totalPayroll)}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Avg Compensation</span>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {dept.avgSalary ? `${(dept.avgSalary / 100000).toFixed(1)} LPA` : '—'}
                  </strong>
                </div>
              </div>

              {/* Department Roles Sample */}
              {dept.titles.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {dept.titles.map((title) => (
                    <span
                      key={title}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-hover)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {title}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Avatar Stack and Drill-down Button */}
            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Overlapping Avatar Stack */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {dept.members.slice(0, 4).map((member, i) => (
                  <div
                    key={member.id}
                    className="avatar-chip"
                    style={{
                      ...getAvatarStyle(member.firstName, member.lastName, member.id),
                      width: '28px',
                      height: '28px',
                      fontSize: '0.7rem',
                      marginLeft: i > 0 ? '-8px' : '0',
                      border: '2px solid var(--bg-surface)',
                    }}
                    title={`${member.firstName} ${member.lastName} (${member.jobTitle})`}
                  >
                    {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                  </div>
                ))}
                {dept.members.length > 4 && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '2px solid var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.675rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginLeft: '-8px',
                    }}
                  >
                    +{dept.members.length - 4}
                  </div>
                )}
              </div>

              {/* View Roster Action */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onSelectDepartment(dept.name)}
                style={{ fontSize: '0.775rem', gap: '0.35rem' }}
              >
                <span>View Roster</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
