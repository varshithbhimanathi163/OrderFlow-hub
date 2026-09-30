import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Phone,
  Calendar,
  ExternalLink,
  MapPin,
  Trash2,
} from 'lucide-react';
import type { OrderSubmission } from '../types.ts';

interface SubmissionsTableProps {
  submissions: OrderSubmission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortBy: 'date' | 'id' | 'name';
  setSortBy: (sort: 'date' | 'id' | 'name') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  setPage: (p: number) => void;
  setPageSize: (size: number) => void;
  onRefresh: () => void;
  onSelectOrder: (order: OrderSubmission) => void;
  onDeleteOrder: (id: string) => void;
  autoRefresh: boolean;
  setAutoRefresh: (auto: boolean) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  setPage,
  setPageSize,
  onRefresh,
  onSelectOrder,
  onDeleteOrder,
  autoRefresh,
  setAutoRefresh,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSortToggle = (column: 'date' | 'id' | 'name') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const renderSortIndicator = (column: 'date' | 'id' | 'name') => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
    );
  };

  const getStatusBadge = (status: OrderSubmission['status']) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            New
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Contacted
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Processing
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/submissions/export/csv';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Toolbar & Search */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search Order ID, Name, Mobile, or Address..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPage(1);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              autoRefresh
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Auto-refresh table every 10 seconds"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-blue-600 animate-ping' : 'bg-slate-400'}`}></span>
            <span>Live Poll</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          {/* Export to CSV */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
            title="Export all submissions as CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
              {/* Requirement: Column 1 MUST be Order ID */}
              <th
                onClick={() => handleSortToggle('id')}
                className="py-3 px-4 sm:px-6 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Order ID</span>
                  {renderSortIndicator('id')}
                </div>
              </th>

              {/* Column 2: Name */}
              <th
                onClick={() => handleSortToggle('name')}
                className="py-3 px-4 sm:px-6 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Name</span>
                  {renderSortIndicator('name')}
                </div>
              </th>

              {/* Column 3: Mobile Number */}
              <th className="py-3 px-4 sm:px-6 select-none">
                <span>Mobile Number</span>
              </th>

              {/* Column 4: Address */}
              <th className="py-3 px-4 sm:px-6 select-none">
                <span>Address</span>
              </th>

              {/* Column 5: Submitted Date & Time */}
              <th
                onClick={() => handleSortToggle('date')}
                className="py-3 px-4 sm:px-6 cursor-pointer hover:bg-slate-100 transition-colors group select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Submitted Date & Time</span>
                  {renderSortIndicator('date')}
                </div>
              </th>

              {/* Actions / Status */}
              <th className="py-3 px-4 sm:px-6 text-right select-none">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading && submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <div className="inline-flex flex-col items-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                    <span className="text-sm font-medium">Loading submissions from database...</span>
                  </div>
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800">No submissions found</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      {searchQuery
                        ? `No records matching "${searchQuery}". Try clearing the search.`
                        : 'No orders have been submitted yet. Use the Form Builder or Live Embed Tester to create one!'}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        Reset search filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              submissions.map((order) => {
                const isCopied = copiedId === order.id;

                return (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  >
                    {/* Column 1: Order ID */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors bg-slate-100 px-2 py-1 rounded border border-slate-200/80">
                          {order.id}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(e, order.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-opacity p-1"
                          title="Copy Order ID"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Column 2: Name */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{order.name}</div>
                      <div className="mt-0.5">{getStatusBadge(order.status)}</div>
                    </td>

                    {/* Column 3: Mobile Number */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <a
                        href={`tel:${order.mobile}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 hover:underline"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{order.mobile}</span>
                      </a>
                    </td>

                    {/* Column 4: Address (with expandable click) */}
                    <td className="py-3.5 px-4 sm:px-6 max-w-xs">
                      <div className="truncate text-xs text-slate-600" title={order.address}>
                        {order.address.replace(/\n/g, ', ')}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(order);
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-0.5 mt-0.5"
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        <span>View complete address</span>
                      </button>
                    </td>

                    {/* Column 5: Submitted Date & Time */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="font-medium">{order.createdAtFormatted}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                        >
                          <Eye className="w-3 h-3 inline mr-1" />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete order ${order.id}?`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete submission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>
            Showing{' '}
            <strong className="text-slate-900 font-semibold">
              {total === 0 ? 0 : (page - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-900 font-semibold">
              {Math.min(page * pageSize, total)}
            </strong>{' '}
            of <strong className="text-slate-900 font-semibold">{total}</strong> total submissions
          </span>

          <span className="text-slate-300">|</span>

          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-medium text-slate-800">
            Page {page} of {Math.max(1, totalPages)}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
