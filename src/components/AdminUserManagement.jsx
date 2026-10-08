import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, UserCheck, UserX, RefreshCw, ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useAlert } from '../context/AlertContext';

/**
 * FR-16: Admin quản lý tài khoản người dùng.
 *
 * API dự kiến (cần đồng bộ với backend):
 * GET   /admin/users?page=0&size=10
 * PATCH /admin/users/{id}/lock
 * PATCH /admin/users/{id}/unlock
 *
 * Component này chỉ quản lý tài khoản trong bảng User, không dùng dữ liệu
 * lịch sử đặt phòng/khách vãng lai của màn hình Quản lý khách hàng.
 */
export default function AdminUserManagement() {
  const { showConfirm, showAlert } = useAlert();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch(`/admin/users?page=${page}&size=${size}`);
      if (!response.ok) {
        throw new Error(response.status === 404
          ? 'API danh sách người dùng chưa được triển khai hoặc endpoint chưa đúng.'
          : `Không thể tải danh sách người dùng (HTTP ${response.status}).`);
      }

      const payload = await response.json();
      // Hỗ trợ cả response Page trực tiếp và response bọc trong { result: Page }.
      const data = payload?.result ?? payload;
      setUsers(Array.isArray(data?.content) ? data.content : []);
      setTotalElements(Number(data?.totalElements ?? 0));
      setTotalPages(Number(data?.totalPages ?? 0));
    } catch (e) {
      setError(e.message || 'Có lỗi xảy ra khi tải danh sách người dùng.');
      setUsers([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const enabledCount = useMemo(
    () => users.filter(user => user.isEnabled === true).length,
    [users]
  );
  const disabledCount = useMemo(
    () => users.filter(user => user.isEnabled === false).length,
    [users]
  );

  
  const changeAccountStatus = async (user) => {
    const roleName = user.role?.name || user.role || '';
    if (roleName === 'ROLE_ADMIN' || roleName === 'ADMIN') {
      showAlert({
        title: 'Thông báo',
        message: 'Không thể khóa tài khoản Quản trị viên!',
        type: 'warning'
      });
      return;
    }

    const currentlyEnabled = user.isEnabled === true;
    const actionLabel = currentlyEnabled ? 'khóa' : 'mở khóa';

    const confirmed = await showConfirm({
      title: `${currentlyEnabled ? 'Khóa' : 'Mở khóa'} tài khoản`,
      message: `Bạn có chắc chắn muốn ${actionLabel} tài khoản "${user.email || user.username || user.fullName}" không?`,
      type: currentlyEnabled ? 'warning' : 'info',
      confirmText: currentlyEnabled ? 'Khóa tài khoản' : 'Mở khóa',
      cancelText: 'Hủy'
    });

    if (!confirmed) {
      return;
    }

    setProcessingId(user.id);
    setNotice('');
    setError('');

    try {
      const endpoint = currentlyEnabled
        ? `/admin/users/${user.id}/lock`
        : `/admin/users/${user.id}/unlock`;

      const response = await apiFetch(endpoint, { method: 'PATCH' });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.result?.errors ||
          data?.message ||
          data?.errors ||
          `Không thể ${actionLabel} tài khoản (HTTP ${response.status}).`;

        setError(message);
        showAlert({
          title: 'Thao tác thất bại',
          message: message,
          type: 'error'
        });
        return;
      }

      const successMsg = currentlyEnabled ? 'Khóa tài khoản thành công!' : 'Mở khóa tài khoản thành công!';
      setNotice(successMsg);
      showAlert({
        title: 'Thành công',
        message: successMsg,
        type: 'success'
      });

      await loadUsers();
    } catch (e) {
      const errText = e.message || `Có lỗi khi ${actionLabel} tài khoản.`;
      setError(errText);
      showAlert({
        title: 'Lỗi',
        message: errText,
        type: 'error'
      });
    } finally {
      setProcessingId(null);
    }
  };


  const goToPage = (nextPage) => {
    if (nextPage < 0 || (totalPages > 0 && nextPage >= totalPages)) return;
    setPage(nextPage);
  };

  const startIndex = totalElements === 0 ? 0 : page * size + 1;
  const endIndex = Math.min((page + 1) * size, totalElements);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 20 }}>
        <SummaryCard icon={<Users size={24} color="#3b82f6" />} iconBg="#eff6ff" label="Tổng tài khoản" value={totalElements} />
        <SummaryCard icon={<UserCheck size={24} color="#16a34a" />} iconBg="#f0fdf4" label="Đang hoạt động trên trang" value={enabledCount} />
        <SummaryCard icon={<UserX size={24} color="#dc2626" />} iconBg="#fef2f2" label="Đã khóa trên trang" value={disabledCount} />
      </div>

      <section style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e293b', fontSize: 18, fontWeight: 700 }}>Danh sách người dùng</h2>
            <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: 13 }}>Quản lý tài khoản và trạng thái truy cập</p>
          </div>
          <button type="button" onClick={loadUsers} disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid #e2e8f0', background: '#fff', borderRadius: 9, padding: '9px 13px', color: '#475569', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
            <RefreshCw size={15} /> Làm mới
          </button>
        </div>

        {error && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 9, padding: 12, marginBottom: 14, fontSize: 13 }}>{error}</div>}
        {notice && <div role="status" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: 9, padding: 12, marginBottom: 14, fontSize: 13 }}>{notice}</div>}

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                {['#', 'Họ và tên', 'Email', 'Số điện thoại', 'Vai trò', 'Trạng thái', 'Thao tác'].map(title => (
                  <th key={title} style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none', padding: '12px 10px', whiteSpace: 'nowrap' }}>{title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 34, color: '#64748b' }}>Đang tải danh sách...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 34, color: '#94a3b8' }}>Không có dữ liệu người dùng.</td></tr>
              ) : users.map((user, index) => {
                const isEnabled = user.isEnabled === true;
                const displayName = user.fullName || user.name || user.username || '—';
                const roleName = user.role?.name || user.role || '—';
                const isAdminAccount = roleName === 'ROLE_ADMIN' || roleName === 'ADMIN';
                return (
                  <tr key={user.id ?? `${user.email}-${index}`}>
                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>{page * size + index + 1}</td>
                    <td style={{ color: '#1e293b', fontWeight: 700 }}>{displayName}</td>
                    <td style={{ color: '#475569' }}>{user.email || '—'}</td>
                    <td style={{ color: '#475569' }}>{user.phone || user.phoneNumber || '—'}</td>
                    <td><span style={{ background: '#f1f5f9', color: '#475569', borderRadius: 20, padding: '4px 9px', fontSize: 11, fontWeight: 600 }}>{roleName}</span></td>
                    <td>
                      <span style={{ background: isEnabled ? '#dcfce7' : '#fee2e2', color: isEnabled ? '#166534' : '#b91c1c', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {isEnabled ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td>
                      {isAdminAccount ? (
                        <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                          Quản trị viên
                        </span>
                      ) : (
                        <button type="button" onClick={() => changeAccountStatus(user)}
                          disabled={processingId === user.id || user.id == null}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 8, padding: '7px 10px', background: isEnabled ? '#fef2f2' : '#f0fdf4', color: isEnabled ? '#b91c1c' : '#166534', fontSize: 12, fontWeight: 700, cursor: processingId === user.id ? 'wait' : 'pointer', opacity: processingId === user.id ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                          {isEnabled ? <Lock size={14} /> : <Unlock size={14} />}
                          {processingId === user.id ? 'Đang xử lý...' : isEnabled ? 'Khóa' : 'Mở khóa'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', marginTop: 14, paddingTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12 }}>
            <span>Hiển thị {startIndex}–{endIndex} trên {totalElements} tài khoản</span>
            <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
              style={{ border: '1px solid #e2e8f0', borderRadius: 7, padding: '5px 7px', color: '#475569', background: '#fff' }} aria-label="Số người dùng mỗi trang">
              {[10, 20, 50].map(value => <option key={value} value={value}>{value}/trang</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button type="button" aria-label="Trang trước" onClick={() => goToPage(page - 1)} disabled={page <= 0 || loading}
              style={paginationButtonStyle(page <= 0 || loading)}><ChevronLeft size={16} /></button>
            <span style={{ color: '#475569', fontSize: 12, minWidth: 86, textAlign: 'center' }}>
              Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}
            </span>
            <button type="button" aria-label="Trang sau" onClick={() => goToPage(page + 1)} disabled={page + 1 >= totalPages || loading}
              style={paginationButtonStyle(page + 1 >= totalPages || loading)}><ChevronRight size={16} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ icon, iconBg, label, value }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div>
        <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 7 }}>{label}</div>
        <div style={{ color: '#1e293b', fontSize: 28, lineHeight: 1.1, fontWeight: 800 }}>{value}</div>
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 13, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
    </div>
  );
}

function paginationButtonStyle(disabled) {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 8,
    border: '1px solid #e2e8f0', background: disabled ? '#f8fafc' : '#fff',
    color: disabled ? '#cbd5e1' : '#475569', cursor: disabled ? 'not-allowed' : 'pointer'
  };
}
