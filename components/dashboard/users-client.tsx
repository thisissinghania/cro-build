"use client";

import { useState, useTransition, useEffect } from "react";
import { Users, Search, Eye, Trash2, Filter, X, Mail, Phone, MapPin, Calendar, Activity } from "lucide-react";
import { deleteUserAction, toggleUserStatusAction, getUsersAction } from "@/actions/users";
import { toast } from "sonner";

interface UserClientProps {
  initialUsers: Array<{
    id: string;
    email: string;
    phone: string | null;
    address: string | null;
    name: string | null;
    role: string;
    emailVerified: Date | null;
    isActive: boolean;
    createdAt: Date;
  }>;
  totalUsersCount: number;
}

export function UsersClient({ initialUsers, totalUsersCount }: UserClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [totalUsers, setTotalUsers] = useState(totalUsersCount);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [pendingFromDate, setPendingFromDate] = useState("");
  const [pendingToDate, setPendingToDate] = useState("");

  const [isPending, startTransition] = useTransition();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery !== debouncedQuery) {
        setCurrentPage(1); // Reset to page 1 on new search
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, debouncedQuery]);

  // Fetch users when payload dependencies change
  useEffect(() => {
    startTransition(async () => {
      const res = await getUsersAction({
        query: debouncedQuery,
        page: currentPage,
        limit: itemsPerPage,
        from: fromDate,
        to: toDate,
      });

      if (res.success && res.users) {
        setUsers(res.users);
        setTotalUsers(res.totalCount || 0);
      } else {
        toast.error(res.error || "Failed to fetch users");
      }
    });
  }, [debouncedQuery, currentPage, itemsPerPage, fromDate, toDate]);

  const totalPages = Math.ceil(totalUsers / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const handleUserUpdate = (updatedUser: any) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 relative">
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">User Management</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage platform users and their plans.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isPending ? 'text-indigo-500 animate-pulse' : 'text-zinc-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full sm:w-[250px] pl-9 pr-4 h-[48px] bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setPendingFromDate(fromDate);
                  setPendingToDate(toDate);
                  setIsFilterOpen(!isFilterOpen);
                }}
                className={`relative flex items-center justify-center w-[48px] h-[48px] bg-white border rounded-lg transition-colors cursor-pointer ${fromDate || toDate
                  ? 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                  : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                  }`}
              >
                <Filter className="w-5 h-5" />
                {(fromDate || toDate) && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-indigo-50"></span>
                )}
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-[360px] bg-white border border-zinc-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-zinc-900 mb-3">Date Range</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-sm text-zinc-600 mb-1.5 block">From</span>
                          <input
                            type="date"
                            value={pendingFromDate}
                            onChange={(e) => setPendingFromDate(e.target.value)}
                            className="w-full h-[48px] px-3 text-sm bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div>
                          <span className="text-sm text-zinc-600 mb-1.5 block">To</span>
                          <input
                            type="date"
                            value={pendingToDate}
                            onChange={(e) => setPendingToDate(e.target.value)}
                            className="w-full h-[48px] px-3 text-sm bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-end gap-2 pt-5 border-t border-zinc-100">
                      <button
                        onClick={() => {
                          setPendingFromDate("");
                          setPendingToDate("");
                          setFromDate("");
                          setToDate("");
                          setCurrentPage(1);
                          setIsFilterOpen(false);
                        }}
                        className="px-4 h-[36px] text-sm font-medium bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors cursor-pointer outline-none shadow-sm"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          setFromDate(pendingFromDate);
                          setToDate(pendingToDate);
                          setCurrentPage(1);
                          setIsFilterOpen(false);
                        }}
                        className="px-5 h-[36px] text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors cursor-pointer outline-none shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={`overflow-x-auto transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-sm text-zinc-500 font-medium">
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Joined On</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3.5 py-8 text-center text-sm text-zinc-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onUpdate={handleUserUpdate}
                    onDelete={(id) => {
                      setUsers(users.filter(u => u.id !== id));
                      setTotalUsers(prev => prev - 1);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-[40px] px-2 bg-white border border-zinc-200 text-zinc-700 text-sm rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-zinc-500 ml-2 sm:ml-4">
              Showing {totalUsers === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalUsers)} of {totalUsers}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1 || isPending}
              className="px-3 h-[40px] flex items-center justify-center text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  disabled={isPending}
                  className={`w-[40px] h-[40px] flex items-center justify-center text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${currentPage === page
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || isPending}
              className="px-3 h-[40px] flex items-center justify-center text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, onUpdate, onDelete }: { user: any, onUpdate: (u: any) => void, onDelete: (id: string) => void }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteUserAction(user.id);
    if (res.error) {
      toast.error(res.error);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    } else if (res.success) {
      toast.success(res.success);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      onDelete(user.id);
    }
  };

  const handleToggleStatus = () => {
    startTransition(async () => {
      const res = await toggleUserStatusAction(user.id, !user.isActive);
      if (res.error) {
        toast.error(res.error);
      } else if (res.success) {
        toast.success(res.success);
        onUpdate({ ...user, isActive: !user.isActive });
      }
    });
  };

  const isActive = user.isActive;

  return (
    <tr className="hover:bg-zinc-50 transition-colors group">
      <td className="p-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-sm font-medium text-zinc-900">{user.name || "N/A"}</div>
        </div>
      </td>
      <td className="p-3.5">
        <div className="text-sm font-medium text-zinc-900">
          {user.email}
        </div>
      </td>
      <td className="p-3.5">
        <div className="text-sm font-medium text-zinc-900">
          {new Date(user.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })}
        </div>
      </td>
      <td className="p-3.5">
        <button
          disabled={isPending}
          onClick={handleToggleStatus}
          className="flex items-center gap-2 cursor-pointer group outline-none disabled:opacity-50"
        >
          <div
            className={`relative w-11 h-6 transition-colors ${isActive ? 'bg-emerald-500' : 'bg-zinc-200'}`}
            style={{ borderRadius: '9999px' }}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'}`}
              style={{ borderRadius: '50%' }}
            ></div>
          </div>
          <span className={`text-[14px] font-medium transition-colors ${isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </button>
      </td>
      <td className="p-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer" title="View">
            <Eye className="w-4 h-4" />
          </button>
          {user.role !== 'ADMIN' && (
            <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {isDeleteModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm text-left"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-rose-50 text-rose-600 mb-5 mx-auto border border-rose-100">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 text-center mb-3">Delete User</h3>
              <p className="text-[16px] text-zinc-600 text-center mb-8 leading-relaxed">
                Are you sure you want to delete <strong className="text-zinc-900 font-semibold">{user.email}</strong>? This action cannot be undone.
              </p>
              <div className="flex items-center gap-4">
                <button
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 h-[48px] text-[16px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex-1 h-[48px] text-[16px] font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Details Drawer */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden text-left flex justify-end">
            <div
              className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
              onClick={() => setIsDrawerOpen(false)}
            />

            <div
              className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-white">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900">User Details</h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 leading-tight mb-0.5">{user.name || "N/A"}</h3>
                    <p className="text-[12px] font-medium text-zinc-500">{user.role}</p>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-4 py-4 border-b border-zinc-100">
                    <div className="p-2.5 bg-zinc-50 rounded-lg text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-zinc-500 font-medium mb-0.5">Email Address</p>
                      <p className="text-sm font-medium text-zinc-900 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-4 border-b border-zinc-100">
                    <div className="p-2.5 bg-zinc-50 rounded-lg text-zinc-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-zinc-500 font-medium mb-0.5">Phone Number</p>
                      <p className="text-sm font-medium text-zinc-900 truncate">{user.phone || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-4 border-b border-zinc-100">
                    <div className="p-2.5 bg-zinc-50 rounded-lg text-zinc-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-zinc-500 font-medium mb-0.5">Address</p>
                      <p className="text-sm font-medium text-zinc-900 break-words">{user.address || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-4 border-b border-zinc-100">
                    <div className="p-2.5 bg-zinc-50 rounded-lg text-zinc-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-zinc-500 font-medium mb-0.5">Joined On</p>
                      <p className="text-sm font-medium text-zinc-900">
                        {new Date(user.createdAt).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-4">
                    <div className="p-2.5 bg-zinc-50 rounded-lg text-zinc-500">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-zinc-500 font-medium mb-0.5">Status</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-900">
                          {user.isActive ? "Active" : "Deactivated"}
                        </p>
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </td>
    </tr>
  );
}
