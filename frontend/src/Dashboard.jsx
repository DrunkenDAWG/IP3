import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { employeeApi, authApi } from './api';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Users,
  Building2,
  RefreshCw,
  X,
  CheckCircle,
  AlertTriangle,
  Mail,
  User,
  Shield,
  Layers,
  Filter,
  Download,
  Calendar,
  IndianRupee,
  Phone,
  MapPin,
  Briefcase,
  ChevronUp,
  ChevronDown,
  Sun,
  Moon,
  Command,
  Check,
  CheckSquare,
  Square,
  LayoutGrid,
  List as ListIcon,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Copy,
  BarChart3
} from 'lucide-react';
import CustomSelect from './CustomSelect';
import { getAvatarStyle } from './avatarUtils';
import DepartmentsView from './views/DepartmentsView';
import OnboardingView from './views/OnboardingView';
import AnalyticsView from './views/AnalyticsView';

export default function Dashboard({ onLogout, theme, onToggleTheme }) {
  // Active View mode: 'people' | 'departments' | 'onboarding' | 'analytics'
  const [activeView, setActiveView] = useState('people');
  const [allEmployees, setAllEmployees] = useState([]);

  // Data states
  const [employees, setEmployees] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);

  // Query & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  // UI view mode: 'table' or 'grid'
  const [viewMode, setViewMode] = useState('table');

  // Multi-selection states
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail Drawer state
  const [drawerEmployee, setDrawerEmployee] = useState(null);
  const [drawerTab, setDrawerTab] = useState('overview'); // 'overview' | 'employment'

  // Command palette state
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');

  // Loading & Modals
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [toast, setToast] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    jobTitle: '',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    phone: '',
    location: '',
    startDate: new Date().toISOString().slice(0, 10),
    salary: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const currentUser = authApi.getCurrentUser();

  // Micro-interaction: Click-to-copy
  const [copiedKey, setCopiedKey] = useState(null);
  const handleCopy = useCallback((text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied: "${text}"`, 'success');
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  }, []);

  // Memoized Custom Dropdown Options
  const departmentOptions = useMemo(() => [
    { value: 'ALL', label: `All Departments (${departments.length})` },
    ...departments.map((dept) => ({ value: dept, label: dept })),
  ], [departments]);

  const statusOptions = useMemo(() => [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active', dotColor: 'var(--status-active-dot)' },
    { value: 'ONBOARDING', label: 'Onboarding', dotColor: 'var(--status-onboarding-dot)' },
    { value: 'ON_LEAVE', label: 'On Leave', dotColor: 'var(--status-leave-dot)' },
    { value: 'TERMINATED', label: 'Terminated', dotColor: 'var(--status-terminated-dot)' },
  ], []);

  const employmentTypeOptions = useMemo(() => [
    { value: 'ALL', label: 'All Employment Types' },
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'CONTRACTOR', label: 'Contractor' },
    { value: 'INTERN', label: 'Intern' },
  ], []);

  const formStatusOptions = [
    { value: 'ACTIVE', label: 'Active', dotColor: 'var(--status-active-dot)' },
    { value: 'ONBOARDING', label: 'Onboarding', dotColor: 'var(--status-onboarding-dot)' },
    { value: 'ON_LEAVE', label: 'On Leave', dotColor: 'var(--status-leave-dot)' },
    { value: 'TERMINATED', label: 'Terminated', dotColor: 'var(--status-terminated-dot)' },
  ];

  const formTypeOptions = [
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'CONTRACTOR', label: 'Contractor' },
    { value: 'INTERN', label: 'Intern' },
  ];

  const bulkStatusOptions = [
    { value: 'ACTIVE', label: 'Active', dotColor: 'var(--status-active-dot)' },
    { value: 'ONBOARDING', label: 'Onboarding', dotColor: 'var(--status-onboarding-dot)' },
    { value: 'ON_LEAVE', label: 'On Leave', dotColor: 'var(--status-leave-dot)' },
    { value: 'TERMINATED', label: 'Terminated', dotColor: 'var(--status-terminated-dot)' },
  ];

  const pageSizeOptions = [
    { value: 10, label: '10' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
  ];

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4000);
  }, []);

  // Keyboard shortcuts (Cmd+K / Ctrl+K and Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCmdOpen(false);
        setDrawerEmployee(null);
        setIsFormModalOpen(false);
        setDeletingEmployee(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch all employees for Department, Onboarding, and Analytics hubs
  const fetchAllEmployees = useCallback(async () => {
    try {
      const all = await employeeApi.getAll();
      setAllEmployees(Array.isArray(all) ? all : []);
    } catch (err) {
      console.error('Failed to load all employee records', err);
    }
  }, []);

  // Fetch departments, stats & all employees
  const fetchMetadata = useCallback(async () => {
    try {
      const [deptData, statsData, allData] = await Promise.all([
        employeeApi.getDepartments(),
        employeeApi.getStats(),
        employeeApi.getAll(),
      ]);
      setDepartments(deptData || []);
      setStats(statsData || null);
      setAllEmployees(Array.isArray(allData) ? allData : []);
    } catch (err) {
      console.error('Failed to load metadata', err);
    }
  }, []);

  // Graduate candidate from Onboarding to Active status
  const handleGraduateToActive = async (empId, empName) => {
    try {
      await employeeApi.bulkUpdateStatus([empId], 'ACTIVE');
      showToast(`🎉 ${empName} has graduated to the Active workforce!`, 'success');
      fetchEmployees();
      fetchMetadata();
      fetchAllEmployees();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to activate candidate status.', 'error');
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Fetch paginated employees
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await employeeApi.getPaged({
        page,
        size,
        search: debouncedSearch,
        department: selectedDepartment,
        status: selectedStatus,
        employmentType: selectedType,
        sortBy,
        sortDir,
      });

      if (data && data.content) {
        setEmployees(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setEmployees(data);
        setTotalElements(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load employee records.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, size, debouncedSearch, selectedDepartment, selectedStatus, selectedType, sortBy, sortDir, showToast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  // Multi-select helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allCurrentIds = employees.map((emp) => emp.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...allCurrentIds])));
    } else {
      const currentIdsSet = new Set(employees.map((emp) => emp.id));
      setSelectedIds(selectedIds.filter((id) => !currentIdsSet.has(id)));
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllCurrentSelected =
    employees.length > 0 && employees.every((emp) => selectedIds.includes(emp.id));

  // Bulk Operations
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} employee record(s)?`)) return;

    try {
      await employeeApi.bulkDelete(selectedIds);
      showToast(`Successfully deleted ${selectedIds.length} employee record(s).`);
      setSelectedIds([]);
      fetchEmployees();
      fetchMetadata();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to bulk delete employees.', 'error');
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await employeeApi.bulkUpdateStatus(selectedIds, newStatus);
      showToast(`Updated ${selectedIds.length} employee(s) to ${newStatus}.`);
      setSelectedIds([]);
      fetchEmployees();
      fetchMetadata();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      await employeeApi.exportCsv({
        search: debouncedSearch,
        department: selectedDepartment,
        status: selectedStatus,
        employmentType: selectedType,
      });
      showToast('Export generated and downloaded successfully.');
    } catch (err) {
      showToast('Failed to export CSV.', 'error');
    }
  };

  // Open Form Modal
  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: departments[0] || 'Engineering',
      jobTitle: '',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      phone: '',
      location: 'Bengaluru, Karnataka',
      startDate: new Date().toISOString().slice(0, 10),
      salary: '',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      department: emp.department || '',
      jobTitle: emp.jobTitle || '',
      employmentType: emp.employmentType || 'FULL_TIME',
      status: emp.status || 'ACTIVE',
      phone: emp.phone || '',
      location: emp.location || '',
      startDate: emp.startDate || new Date().toISOString().slice(0, 10),
      salary: emp.salary != null ? String(emp.salary) : '',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.department.trim()) errors.department = 'Department is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        department: formData.department.trim(),
        jobTitle: formData.jobTitle.trim(),
        employmentType: formData.employmentType,
        status: formData.status,
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        startDate: formData.startDate,
        salary: formData.salary ? parseFloat(formData.salary) : null,
      };

      if (editingEmployee) {
        const updated = await employeeApi.update(editingEmployee.id, payload);
        showToast(`Updated record for ${updated.firstName} ${updated.lastName}.`);
        if (drawerEmployee?.id === updated.id) {
          setDrawerEmployee(updated);
        }
      } else {
        const created = await employeeApi.create(payload);
        showToast(`Created employee profile for ${created.firstName} ${created.lastName}.`);
      }

      setIsFormModalOpen(false);
      fetchEmployees();
      fetchMetadata();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save employee profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Individual
  const handleDeleteConfirm = async () => {
    if (!deletingEmployee) return;
    setIsSubmitting(true);
    try {
      await employeeApi.delete(deletingEmployee.id);
      showToast(`Removed employee ${deletingEmployee.firstName} ${deletingEmployee.lastName}.`);
      if (drawerEmployee?.id === deletingEmployee.id) {
        setDrawerEmployee(null);
      }
      setDeletingEmployee(null);
      fetchEmployees();
      fetchMetadata();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete record.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency in Indian numbering system with INR and LPA notation
  const formatSalary = (val) => {
    if (val == null || val === '') return '—';
    const num = Number(val);
    const inrFormatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);

    if (num >= 100000) {
      const lpa = (num / 100000).toFixed(1).replace(/\.0$/, '');
      return `${inrFormatted} (${lpa} LPA)`;
    }
    return inrFormatted;
  };

  // Initials Avatar generator
  const getInitials = (first, last) => {
    return `${(first || '').charAt(0)}${(last || '').charAt(0)}`.toUpperCase();
  };

  const hasActiveFilters =
    debouncedSearch || selectedDepartment !== 'ALL' || selectedStatus !== 'ALL' || selectedType !== 'ALL';

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('ALL');
    setSelectedStatus('ALL');
    setSelectedType('ALL');
    setPage(0);
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast">
          {toast.type === 'success' ? (
            <CheckCircle size={18} style={{ color: 'var(--status-active-dot)' }} />
          ) : (
            <AlertTriangle size={18} style={{ color: 'var(--danger-solid)' }} />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Enterprise Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="org-switcher" title="Organization">
            <div className="org-badge">BT</div>
            <div className="org-info">
              <span className="org-name">BharatTech Solutions Pvt. Ltd.</span>
              <span className="org-tier">Bengaluru HQ · PAN India</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Directory</div>
          <button
            className={`nav-item ${activeView === 'people' ? 'active' : ''}`}
            onClick={() => setActiveView('people')}
            title="Workforce Directory"
          >
            <Users size={16} />
            <span>People & Teams</span>
            <span className="nav-item-badge">{totalElements}</span>
          </button>
          <button
            className={`nav-item ${activeView === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveView('departments')}
            title="Departments & Functional Units Hub"
          >
            <Building2 size={16} />
            <span>Departments Hub</span>
            <span className="nav-item-badge">{departments.length}</span>
          </button>

          <div className="nav-section-title" style={{ marginTop: '1rem' }}>Operations</div>
          <button
            className={`nav-item ${activeView === 'onboarding' ? 'active' : ''}`}
            onClick={() => setActiveView('onboarding')}
            title="Onboarding Operations Pipeline"
          >
            <Sparkles size={16} />
            <span>Onboarding Pipeline</span>
            {stats?.onboardingCount > 0 && (
              <span className="nav-item-badge" style={{ backgroundColor: 'var(--status-onboarding-bg)', color: 'var(--status-onboarding-text)' }}>
                {stats.onboardingCount}
              </span>
            )}
          </button>
          <button
            className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveView('analytics')}
            title="Workforce Analytics & Export Center"
          >
            <BarChart3 size={16} />
            <span>Analytics & Reports</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div
              className="avatar-chip"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                color: '#ffffff',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
              }}
            >
              {currentUser.charAt(0).toUpperCase()}
            </div>
            <div className="user-profile-details">
              <span className="user-display-name">{currentUser}</span>
              <span className="user-display-role">Administrator</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              className="footer-action-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="footer-action-btn"
              onClick={onLogout}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <h1 className="page-title">
              {activeView === 'people' && 'Bharat Workforce Directory'}
              {activeView === 'departments' && 'Departments & Functional Units'}
              {activeView === 'onboarding' && 'Onboarding Operations Pipeline'}
              {activeView === 'analytics' && 'Workforce Analytics & Export Center'}
            </h1>
            <button className="command-trigger-btn" onClick={() => setIsCmdOpen(true)}>
              <Search size={14} />
              <span>Quick search or jump to...</span>
              <span className="kbd-shortcut">⌘K</span>
            </button>
          </div>

          <div className="header-actions">
            {activeView === 'people' && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={handleExportCsv} title="Download CSV">
                  <Download size={15} />
                  <span>Export CSV</span>
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
                  <Plus size={15} />
                  <span>Add Member</span>
                </button>
              </>
            )}
            {activeView === 'departments' && (
              <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
                <Plus size={15} />
                <span>Add Member</span>
              </button>
            )}
            {activeView === 'onboarding' && (
              <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
                <Plus size={15} />
                <span>Add New Joiner</span>
              </button>
            )}
            {activeView === 'analytics' && (
              <button className="btn btn-primary btn-sm" onClick={handleExportCsv}>
                <Download size={15} />
                <span>Export Master CSV</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Container */}
        <main className="page-content">
          {activeView === 'people' && (
            <>
              {/* Executive Metrics Overview */}
              <section className="metrics-row">
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Total Headcount</span>
                <div className="metric-icon-wrap">
                  <Users size={16} />
                </div>
              </div>
              <div className="metric-value-row">
                <span className="metric-value">{stats?.totalHeadcount || totalElements}</span>
                <span className="metric-subtext">Registered Profiles</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Active Workforce</span>
                <div className="metric-icon-wrap">
                  <TrendingUp size={16} style={{ color: 'var(--status-active-dot)' }} />
                </div>
              </div>
              <div className="metric-value-row">
                <span className="metric-value">{stats?.activeCount || 0}</span>
                <span className="metric-subtext">
                  {stats?.totalHeadcount ? `${Math.round((stats.activeCount / stats.totalHeadcount) * 100)}% active` : ''}
                </span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">New Hires (90d)</span>
                <div className="metric-icon-wrap">
                  <Clock size={16} style={{ color: 'var(--status-onboarding-dot)' }} />
                </div>
              </div>
              <div className="metric-value-row">
                <span className="metric-value">{stats?.newHiresLast90Days || 0}</span>
                <span className="metric-subtext">Recent Additions</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Active Departments</span>
                <div className="metric-icon-wrap">
                  <Building2 size={16} />
                </div>
              </div>
              <div className="metric-value-row">
                <span className="metric-value">{departments.length}</span>
                <span className="metric-subtext">Functional Groups</span>
              </div>
            </div>
          </section>

          {/* Table Toolbar & Multi-Filters */}
          <section className="table-toolbar">
            <div className="toolbar-primary-row">
              <div className="search-field-wrapper">
                <Search size={16} className="search-field-icon" />
                <input
                  type="text"
                  className="search-field-input"
                  placeholder="Search by name, email, title, Indian city... (/ to focus)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="search-clear-button" onClick={() => setSearchTerm('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={fetchEmployees}
                  title="Refresh records"
                  disabled={isLoading}
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>

                <div className="view-mode-toggle">
                  <button
                    className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="Table view"
                  >
                    <ListIcon size={15} />
                  </button>
                  <button
                    className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <LayoutGrid size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Dropdowns Row */}
            <div className="toolbar-filters-row">
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Filter size={13} /> Filter:
              </span>

              {/* Department Dropdown */}
              <CustomSelect
                variant="filter"
                options={departmentOptions}
                value={selectedDepartment}
                onChange={(val) => {
                  setSelectedDepartment(val);
                  setPage(0);
                }}
                ariaLabel="Filter by Department"
              />

              {/* Status Dropdown */}
              <CustomSelect
                variant="filter"
                options={statusOptions}
                value={selectedStatus}
                onChange={(val) => {
                  setSelectedStatus(val);
                  setPage(0);
                }}
                ariaLabel="Filter by Status"
              />

              {/* Employment Type Dropdown */}
              <CustomSelect
                variant="filter"
                options={employmentTypeOptions}
                value={selectedType}
                onChange={(val) => {
                  setSelectedType(val);
                  setPage(0);
                }}
                ariaLabel="Filter by Employment Type"
              />

              {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={resetAllFilters}>
                  Clear all filters
                </button>
              )}
            </div>
          </section>

          {/* Directory Content (Table or Grid) */}
          <section className="table-container">
            {viewMode === 'table' ? (
              <div className="table-responsive">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isAllCurrentSelected}
                          onChange={handleSelectAll}
                          aria-label="Select all rows"
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                      <th className="sortable-th" onClick={() => handleSort('firstName')}>
                        <div className="th-content">
                          <span>Team Member</span>
                          {sortBy === 'firstName' && (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                        </div>
                      </th>
                      <th className="sortable-th" onClick={() => handleSort('department')}>
                        <div className="th-content">
                          <span>Department</span>
                          {sortBy === 'department' && (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                        </div>
                      </th>
                      <th className="sortable-th" onClick={() => handleSort('status')}>
                        <div className="th-content">
                          <span>Status</span>
                          {sortBy === 'status' && (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                        </div>
                      </th>
                      <th>Type</th>
                      <th className="sortable-th" onClick={() => handleSort('location')}>
                        <div className="th-content">
                          <span>Location</span>
                          {sortBy === 'location' && (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                        </div>
                      </th>
                      <th className="sortable-th" onClick={() => handleSort('startDate')}>
                        <div className="th-content">
                          <span>Start Date</span>
                          {sortBy === 'startDate' && (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                        </div>
                      </th>
                      <th style={{ textAlign: 'right', width: '90px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, idx) => (
                        <tr key={`skeleton-${idx}`}>
                          <td style={{ textAlign: 'center' }}>
                            <div className="skeleton-box" style={{ width: '16px', height: '16px' }} />
                          </td>
                          <td>
                            <div className="employee-cell-profile">
                              <div className="skeleton-avatar" />
                              <div className="employee-cell-meta" style={{ gap: '0.4rem' }}>
                                <div className="skeleton-box" style={{ width: `${100 + (idx % 3) * 25}px`, height: '14px' }} />
                                <div className="skeleton-box" style={{ width: `${140 + (idx % 2) * 20}px`, height: '11px' }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="skeleton-box" style={{ width: '90px', height: '14px' }} />
                          </td>
                          <td>
                            <div className="skeleton-box" style={{ width: '70px', height: '20px', borderRadius: '12px' }} />
                          </td>
                          <td>
                            <div className="skeleton-box" style={{ width: '65px', height: '14px' }} />
                          </td>
                          <td>
                            <div className="skeleton-box" style={{ width: '110px', height: '14px' }} />
                          </td>
                          <td>
                            <div className="skeleton-box" style={{ width: '80px', height: '14px' }} />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                              <div className="skeleton-box" style={{ width: '28px', height: '28px' }} />
                              <div className="skeleton-box" style={{ width: '28px', height: '28px' }} />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : employees.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                          <Users size={40} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '0.75rem' }} />
                          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>No employee profiles found</h3>
                          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {hasActiveFilters ? 'Try adjusting your search query or filters.' : 'Get started by creating your first team member.'}
                          </p>
                          {hasActiveFilters ? (
                            <button className="btn btn-secondary btn-sm" onClick={resetAllFilters} style={{ marginTop: '1rem' }}>
                              Reset Filters
                            </button>
                          ) : (
                            <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal} style={{ marginTop: '1rem' }}>
                              Add First Member
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      employees.map((emp) => {
                        const isSelected = selectedIds.includes(emp.id);
                        return (
                          <tr
                            key={emp.id}
                            className={`table-row-interactive ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setDrawerEmployee(emp);
                              setDrawerTab('overview');
                            }}
                          >
                            <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleSelectRow(emp.id, e)}
                                aria-label={`Select ${emp.firstName} ${emp.lastName}`}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            <td>
                              <div className="employee-cell-profile">
                                <div
                                  className="employee-cell-avatar"
                                  style={getAvatarStyle(emp.firstName, emp.lastName, emp.id)}
                                >
                                  {getInitials(emp.firstName, emp.lastName)}
                                </div>
                                <div className="employee-cell-meta">
                                  <span className="employee-cell-name">
                                    {emp.firstName} {emp.lastName}
                                  </span>
                                  <span className="employee-cell-title" style={{ display: 'flex', alignItems: 'center' }}>
                                    <span>{emp.jobTitle || 'Team Member'}</span>
                                    <span style={{ margin: '0 0.35rem', opacity: 0.3 }}>·</span>
                                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.725rem' }}>{emp.email}</span>
                                    <button
                                      type="button"
                                      className={`inline-copy-btn ${copiedKey === `table-email-${emp.id}` ? 'copied' : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(emp.email, `table-email-${emp.id}`);
                                      }}
                                      title="Copy email address"
                                      aria-label="Copy email"
                                    >
                                      {copiedKey === `table-email-${emp.id}` ? <Check size={11} /> : <Copy size={11} />}
                                    </button>
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 500 }}>{emp.department}</span>
                            </td>
                            <td>
                              <span className={`status-pill status-${emp.status || 'ACTIVE'}`}>
                                <span className="status-dot"></span>
                                <span>{(emp.status || 'ACTIVE').replace('_', ' ')}</span>
                              </span>
                            </td>
                            <td>
                              <span className="employment-tag">
                                {(emp.employmentType || 'FULL_TIME').replace('_', ' ')}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                                <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                                <span>{emp.location || 'Remote'}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                {emp.startDate || '—'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleOpenEditModal(emp)}
                                  title="Edit profile"
                                  aria-label="Edit"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setDeletingEmployee(emp)}
                                  title="Delete record"
                                  aria-label="Delete"
                                  style={{ color: 'var(--danger-solid)' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid / Card View Mode */
              <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="metric-card table-row-interactive"
                    style={{ cursor: 'pointer', padding: '1.25rem' }}
                    onClick={() => {
                      setDrawerEmployee(emp);
                      setDrawerTab('overview');
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div
                        className="employee-cell-avatar"
                        style={{
                          ...getAvatarStyle(emp.firstName, emp.lastName, emp.id),
                          width: '42px',
                          height: '42px',
                          fontSize: '0.9rem',
                        }}
                      >
                        {getInitials(emp.firstName, emp.lastName)}
                      </div>
                      <span className={`status-pill status-${emp.status || 'ACTIVE'}`}>
                        <span className="status-dot"></span>
                        <span>{(emp.status || 'ACTIVE').replace('_', ' ')}</span>
                      </span>
                    </div>

                    <div style={{ marginTop: '0.75rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                        {emp.firstName} {emp.lastName}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {emp.jobTitle || 'Specialist'}
                      </p>
                    </div>

                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building2 size={13} style={{ color: 'var(--text-muted)' }} />
                        <span>{emp.department}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                          <Mail size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.email}</span>
                        </div>
                        <button
                          type="button"
                          className={`inline-copy-btn ${copiedKey === `grid-email-${emp.id}` ? 'copied' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(emp.email, `grid-email-${emp.id}`);
                          }}
                          title="Copy email address"
                        >
                          {copiedKey === `grid-email-${emp.id}` ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                        <span>{emp.location || 'Remote'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls Footer */}
            <div className="table-pagination-footer">
              <div className="pagination-range-text">
                Showing{' '}
                <strong>
                  {totalElements === 0 ? 0 : page * size + 1}
                </strong>{' '}
                to{' '}
                <strong>
                  {Math.min((page + 1) * size, totalElements)}
                </strong>{' '}
                of <strong>{totalElements}</strong> employees
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Rows:</span>
                  <CustomSelect
                    variant="compact"
                    options={pageSizeOptions}
                    value={size}
                    onChange={(val) => {
                      setSize(parseInt(val, 10));
                      setPage(0);
                    }}
                    ariaLabel="Rows per page"
                  />
                </div>

                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter((p) => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && p - arr[idx - 1] > 1 && (
                          <span style={{ color: 'var(--text-muted)', padding: '0 0.25rem' }}>…</span>
                        )}
                        <button
                          className={`page-btn ${page === p ? 'active' : ''}`}
                          onClick={() => setPage(p)}
                        >
                          {p + 1}
                        </button>
                      </React.Fragment>
                    ))}
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeView === 'departments' && (
        <DepartmentsView
          employees={allEmployees.length > 0 ? allEmployees : employees}
          departments={departments}
          onSelectDepartment={(dept) => {
            setSelectedDepartment(dept);
            setActiveView('people');
            setPage(0);
          }}
          onAddMember={handleOpenAddModal}
          formatSalary={formatSalary}
        />
      )}

      {activeView === 'onboarding' && (
        <OnboardingView
          employees={allEmployees.length > 0 ? allEmployees : employees}
          onGraduateToActive={handleGraduateToActive}
          onOpenDrawer={(emp) => {
            setDrawerEmployee(emp);
            setDrawerTab('overview');
          }}
          onAddNewHire={handleOpenAddModal}
        />
      )}

      {activeView === 'analytics' && (
        <AnalyticsView
          employees={allEmployees.length > 0 ? allEmployees : employees}
          departments={departments}
          stats={stats}
          onExportCsv={handleExportCsv}
          formatSalary={formatSalary}
        />
      )}
    </main>
      </div>

      {/* Slide-Over Employee Detail Drawer */}
      {drawerEmployee && (
        <div className="drawer-backdrop" onClick={() => setDrawerEmployee(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Employee Profile #{drawerEmployee.id}
              </span>
              <button className="drawer-close-btn" onClick={() => setDrawerEmployee(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="drawer-profile-banner">
              <div
                className="drawer-avatar-lg"
                style={getAvatarStyle(drawerEmployee.firstName, drawerEmployee.lastName, drawerEmployee.id)}
              >
                {getInitials(drawerEmployee.firstName, drawerEmployee.lastName)}
              </div>
              <div className="drawer-profile-info">
                <h3 className="drawer-name">
                  {drawerEmployee.firstName} {drawerEmployee.lastName}
                </h3>
                <span className="drawer-title">
                  {drawerEmployee.jobTitle || 'Specialist'} · {drawerEmployee.department}
                </span>
                <div style={{ marginTop: '0.35rem' }}>
                  <span className={`status-pill status-${drawerEmployee.status || 'ACTIVE'}`}>
                    <span className="status-dot"></span>
                    <span>{(drawerEmployee.status || 'ACTIVE').replace('_', ' ')}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="drawer-nav-tabs">
              <button
                className={`drawer-tab ${drawerTab === 'overview' ? 'active' : ''}`}
                onClick={() => setDrawerTab('overview')}
              >
                Overview
              </button>
              <button
                className={`drawer-tab ${drawerTab === 'employment' ? 'active' : ''}`}
                onClick={() => setDrawerTab('employment')}
              >
                Employment Details
              </button>
            </div>

            <div className="drawer-body">
              {drawerTab === 'overview' ? (
                <>
                  <div className="detail-group">
                    <span className="detail-group-title">Contact Information</span>
                    <div className="detail-row">
                      <span className="detail-label"><Mail size={14} /> Work Email</span>
                      <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{drawerEmployee.email}</span>
                        <button
                          type="button"
                          className={`inline-copy-btn ${copiedKey === 'drawer-email' ? 'copied' : ''}`}
                          onClick={() => handleCopy(drawerEmployee.email, 'drawer-email')}
                          title="Copy email address"
                        >
                          {copiedKey === 'drawer-email' ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label"><Phone size={14} /> Phone</span>
                      <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{drawerEmployee.phone || 'Not provided'}</span>
                        {drawerEmployee.phone && (
                          <button
                            type="button"
                            className={`inline-copy-btn ${copiedKey === 'drawer-phone' ? 'copied' : ''}`}
                            onClick={() => handleCopy(drawerEmployee.phone, 'drawer-phone')}
                            title="Copy phone number"
                          >
                            {copiedKey === 'drawer-phone' ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label"><MapPin size={14} /> Location</span>
                      <span className="detail-value">{drawerEmployee.location || 'Remote'}</span>
                    </div>
                  </div>

                  <div className="detail-group">
                    <span className="detail-group-title">Organization</span>
                    <div className="detail-row">
                      <span className="detail-label"><Building2 size={14} /> Department</span>
                      <span className="detail-value">{drawerEmployee.department}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label"><Briefcase size={14} /> Employment Type</span>
                      <span className="detail-value">
                        {(drawerEmployee.employmentType || 'FULL_TIME').replace('_', ' ')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label"><Calendar size={14} /> Start Date</span>
                      <span className="detail-value">{drawerEmployee.startDate || '—'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="detail-group">
                  <span className="detail-group-title">Compensation & Role</span>
                  <div className="detail-row">
                    <span className="detail-label"><IndianRupee size={14} /> Annual CTC (Cost to Company)</span>
                    <span className="detail-value">{formatSalary(drawerEmployee.salary)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label"><Clock size={14} /> Created At</span>
                    <span className="detail-value">
                      {drawerEmployee.createdAt ? new Date(drawerEmployee.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label"><RefreshCw size={14} /> Last Updated</span>
                    <span className="detail-value">
                      {drawerEmployee.updatedAt ? new Date(drawerEmployee.updatedAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleOpenEditModal(drawerEmployee)}
              >
                <Edit2 size={14} />
                <span>Edit Profile</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDeletingEmployee(drawerEmployee)}
                style={{ color: 'var(--danger-solid)' }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Multi-Select Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-floating-bar">
          <div className="bulk-selection-count">
            <CheckSquare size={16} style={{ color: 'var(--status-active-dot)' }} />
            <span>{selectedIds.length} employee{selectedIds.length > 1 ? 's' : ''} selected</span>
          </div>

          <div className="bulk-bar-divider"></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status:</span>
            <CustomSelect
              variant="bulk"
              placeholder="Set Status..."
              options={bulkStatusOptions}
              value=""
              onChange={(val) => handleBulkStatusChange(val)}
              ariaLabel="Set status for selected employees"
            />
          </div>

          <button className="btn btn-secondary btn-sm" onClick={handleBulkDelete} style={{ color: 'var(--danger-solid)' }}>
            <Trash2 size={14} />
            <span>Delete Selected</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedIds([])}
            title="Deselect all"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Command Palette (Ctrl+K) */}
      {isCmdOpen && (
        <div className="cmd-palette-backdrop" onClick={() => setIsCmdOpen(false)}>
          <div className="cmd-palette-box" onClick={(e) => e.stopPropagation()}>
            <div className="cmd-palette-input-row">
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="cmd-palette-input"
                placeholder="Type a team member name, action, or department..."
                value={cmdSearch}
                onChange={(e) => setCmdSearch(e.target.value)}
                autoFocus
              />
              <span className="kbd-shortcut">ESC</span>
            </div>

            <div className="cmd-palette-results">
              <div style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Quick Actions
              </div>
              <button
                className="cmd-palette-item"
                onClick={() => {
                  setIsCmdOpen(false);
                  handleOpenAddModal();
                }}
              >
                <Plus size={16} />
                <span>Add new team member profile</span>
              </button>
              <button
                className="cmd-palette-item"
                onClick={() => {
                  setIsCmdOpen(false);
                  handleExportCsv();
                }}
              >
                <Download size={16} />
                <span>Export workforce directory to CSV</span>
              </button>
              <button
                className="cmd-palette-item"
                onClick={() => {
                  setIsCmdOpen(false);
                  onToggleTheme();
                }}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} theme</span>
              </button>

              <div style={{ padding: '0.75rem 0.75rem 0.35rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Jump to Employee
              </div>
              {employees
                .filter((e) =>
                  `${e.firstName} ${e.lastName} ${e.email} ${e.jobTitle} ${e.department}`
                    .toLowerCase()
                    .includes(cmdSearch.toLowerCase())
                )
                .slice(0, 6)
                .map((emp) => (
                  <button
                    key={emp.id}
                    className="cmd-palette-item"
                    onClick={() => {
                      setIsCmdOpen(false);
                      setDrawerEmployee(emp);
                      setDrawerTab('overview');
                    }}
                  >
                    <div
                      className="avatar-chip"
                      style={{
                        ...getAvatarStyle(emp.firstName, emp.lastName, emp.id),
                        width: '24px',
                        height: '24px',
                        fontSize: '0.65rem',
                      }}
                    >
                      {getInitials(emp.firstName, emp.lastName)}
                    </div>
                    <span>{emp.firstName} {emp.lastName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {emp.department}
                    </span>
                  </button>
                ))}
            </div>

            <div className="cmd-palette-footer">
              <span>Navigation</span>
              <span>Press <kbd>ESC</kbd> to exit</span>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {isFormModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingEmployee ? 'Edit Employee Profile' : 'Add New Team Member'}
              </h3>
              <button className="drawer-close-btn" onClick={() => setIsFormModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="first-name">First Name *</label>
                  <input
                    id="first-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rajesh"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                  {formErrors.firstName && <span className="form-error-msg">{formErrors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="last-name">Last Name *</label>
                  <input
                    id="last-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sharma"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                  {formErrors.lastName && <span className="form-error-msg">{formErrors.lastName}</span>}
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Work Email *</label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="e.g. rajesh.sharma@bharattech.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  {formErrors.email && <span className="form-error-msg">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98450 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="job-title">Job Title</label>
                  <input
                    id="job-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Principal Distributed Systems Architect"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="department">Department *</label>
                  <input
                    id="department"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Engineering, Product Design, Finance"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                  {formErrors.department && <span className="form-error-msg">{formErrors.department}</span>}
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Employment Status</label>
                  <CustomSelect
                    variant="form"
                    options={formStatusOptions}
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val })}
                    ariaLabel="Employment Status"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="type">Employment Type</label>
                  <CustomSelect
                    variant="form"
                    options={formTypeOptions}
                    value={formData.employmentType}
                    onChange={(val) => setFormData({ ...formData, employmentType: val })}
                    ariaLabel="Employment Type"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Work Location</label>
                  <input
                    id="location"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bengaluru, Karnataka (or Mumbai, Pune, Remote)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="start-date">Start Date</label>
                  <input
                    id="start-date"
                    type="date"
                    className="form-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="salary">Annual CTC (INR ₹ / LPA)</label>
                <input
                  id="salary"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 2400000 (24 LPA)"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingEmployee ? 'Update Profile' : 'Create Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEmployee && (
        <div className="modal-backdrop" onClick={() => setDeletingEmployee(null)}>
          <div className="modal-content modal-content-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger-solid)' }}>
                Delete Employee Profile?
              </h3>
              <button className="drawer-close-btn" onClick={() => setDeletingEmployee(null)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Are you sure you want to permanently remove{' '}
                <strong>
                  {deletingEmployee.firstName} {deletingEmployee.lastName}
                </strong>{' '}
                ({deletingEmployee.email}) from the workforce directory? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeletingEmployee(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
