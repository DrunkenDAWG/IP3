import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle,
  Clock,
  Shield,
  Laptop,
  Mail,
  UserCheck,
  ArrowRight,
  ExternalLink,
  Plus,
  MapPin,
  Calendar,
  Building2,
  Check
} from 'lucide-react';
import { getAvatarStyle } from '../avatarUtils';

const ONBOARDING_TASKS = [
  { id: 'kyc', label: 'KYC, PAN & Address Verification', icon: Shield },
  { id: 'hardware', label: 'Workstation & Hardware Shipped', icon: Laptop },
  { id: 'credentials', label: 'Corporate Email & Cloud Access', icon: Mail },
  { id: 'orientation', label: 'Team Induction & Manager 1:1', icon: UserCheck },
];

export default function OnboardingView({
  employees = [],
  onGraduateToActive,
  onOpenDrawer,
  onAddNewHire,
}) {
  // Filter new hires currently in onboarding
  const onboardingMembers = employees.filter((e) => e.status === 'ONBOARDING');

  // Interactive task completion state persisted in localStorage
  const [taskState, setTaskState] = useState(() => {
    try {
      const saved = localStorage.getItem('bharat_onboarding_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleTask = (empId, taskId) => {
    setTaskState((prev) => {
      const currentEmpTasks = prev[empId] || {};
      const updated = {
        ...prev,
        [empId]: {
          ...currentEmpTasks,
          [taskId]: !currentEmpTasks[taskId],
        },
      };
      localStorage.setItem('bharat_onboarding_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const getProgress = (empId) => {
    const empTasks = taskState[empId] || {};
    const completedCount = ONBOARDING_TASKS.filter((t) => !!empTasks[t.id]).length;
    return {
      completedCount,
      totalCount: ONBOARDING_TASKS.length,
      percentage: Math.round((completedCount / ONBOARDING_TASKS.length) * 100),
      isReady: completedCount === ONBOARDING_TASKS.length,
    };
  };

  const readyForActivationCount = onboardingMembers.filter((e) => getProgress(e.id).isReady).length;

  return (
    <div className="onboarding-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Onboarding Operations Pipeline
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            New joiner welcome track, statutory verification, equipment provisioning, and graduation to Active.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={onAddNewHire}>
          <Plus size={15} />
          <span>Add New Joiner</span>
        </button>
      </div>

      {/* Metric Highlights Strip */}
      <section className="metrics-row">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">In Onboarding</span>
            <div className="metric-icon-wrap">
              <Sparkles size={16} style={{ color: '#0ea5e9' }} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{onboardingMembers.length}</span>
            <span className="metric-subtext">Active Candidates</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Ready for Activation</span>
            <div className="metric-icon-wrap">
              <CheckCircle size={16} style={{ color: 'var(--status-active-dot)' }} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{readyForActivationCount}</span>
            <span className="metric-subtext">All Tasks Verified</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Pending Verification</span>
            <div className="metric-icon-wrap">
              <Clock size={16} style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{onboardingMembers.length - readyForActivationCount}</span>
            <span className="metric-subtext">In-flight Checks</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Pipeline Velocity</span>
            <div className="metric-icon-wrap">
              <Shield size={16} style={{ color: '#8b5cf6' }} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">
              {onboardingMembers.length > 0
                ? `${Math.round(
                    onboardingMembers.reduce((sum, e) => sum + getProgress(e.id).percentage, 0) /
                      onboardingMembers.length
                  )}%`
                : '100%'}
            </span>
            <span className="metric-subtext">Avg Progress</span>
          </div>
        </div>
      </section>

      {/* Candidates List / Pipeline Grid */}
      {onboardingMembers.length === 0 ? (
        <div
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--status-active-bg)',
              color: 'var(--status-active-dot)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <CheckCircle size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Onboarding Queue is Clear!
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', maxWidth: '420px', margin: '0.35rem auto 1.5rem' }}>
            All team members have completed their verification steps and are actively deployed in their respective teams.
          </p>
          <button className="btn btn-primary btn-sm" onClick={onAddNewHire}>
            <Plus size={15} />
            <span>Add a New Candidate</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {onboardingMembers.map((emp) => {
            const { completedCount, totalCount, percentage, isReady } = getProgress(emp.id);

            return (
              <div
                key={emp.id}
                className="metric-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)',
                  border: isReady ? '1px solid var(--status-active-dot)' : '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  position: 'relative',
                  boxShadow: isReady ? '0 0 0 1px var(--status-active-dot)' : 'var(--shadow-sm)',
                }}
              >
                <div>
                  {/* Candidate Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        className="employee-cell-avatar"
                        style={{
                          ...getAvatarStyle(emp.firstName, emp.lastName, emp.id),
                          width: '46px',
                          height: '46px',
                          fontSize: '1rem',
                        }}
                      >
                        {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {emp.firstName} {emp.lastName}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {emp.jobTitle || 'Specialist'}
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onOpenDrawer(emp)}
                      title="View complete profile"
                      style={{ padding: '0.35rem 0.5rem' }}
                    >
                      <ExternalLink size={13} />
                    </button>
                  </div>

                  {/* Candidate Meta Info */}
                  <div
                    style={{
                      marginTop: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Building2 size={13} style={{ color: 'var(--text-muted)' }} />
                      {emp.department}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                      {emp.location || 'Remote'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                      Joined {emp.startDate || 'Recently'}
                    </span>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div style={{ marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Onboarding Checklist ({completedCount}/{totalCount})
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: isReady ? 'var(--status-active-dot)' : '#0ea5e9',
                        }}
                      >
                        {percentage}% Complete
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '7px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: isReady
                            ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(90deg, #0ea5e9 0%, #6366f1 100%)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Interactive Checklist Items */}
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {ONBOARDING_TASKS.map((task) => {
                      const isDone = !!(taskState[emp.id]?.[task.id]);
                      const Icon = task.icon;

                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(emp.id, task.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0.65rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isDone ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            cursor: 'pointer',
                            fontSize: '0.785rem',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Icon size={14} style={{ color: isDone ? 'var(--status-active-dot)' : 'var(--text-muted)' }} />
                            <span style={{ color: isDone ? 'var(--text-primary)' : 'var(--text-secondary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                              {task.label}
                            </span>
                          </div>

                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: isDone ? 'none' : '1px solid var(--border-strong)',
                              backgroundColor: isDone ? 'var(--status-active-dot)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                            }}
                          >
                            {isDone && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    className={`btn ${isReady ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => onGraduateToActive(emp.id, `${emp.firstName} ${emp.lastName}`)}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      backgroundColor: isReady ? 'var(--status-active-dot)' : undefined,
                      borderColor: isReady ? 'var(--status-active-dot)' : undefined,
                    }}
                  >
                    <CheckCircle size={14} />
                    <span>Graduate to Active Workforce</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
