import React, { useState } from 'react';
import { Users, Phone, MapPin, Search, Calendar, ShoppingBag, ArrowUpDown } from 'lucide-react';
import type { OrderSubmission } from '../types.ts';

interface CustomersTabProps {
  submissions: OrderSubmission[];
  onSelectOrder: (order: OrderSubmission) => void;
}

interface CustomerProfile {
  name: string;
  mobile: string;
  address: string;
  orderCount: number;
  lastOrderId: string;
  lastOrderDate: string;
  latestOrder: OrderSubmission;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  submissions,
  onSelectOrder,
}) => {
  const [search, setSearch] = useState('');

  // Group submissions by phone/mobile or name
  const customerMap = new Map<string, CustomerProfile>();

  submissions.forEach((ord) => {
    const key = (ord.mobile || ord.name).trim().toLowerCase();
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: ord.name,
        mobile: ord.mobile,
        address: ord.address,
        orderCount: 1,
        lastOrderId: ord.id,
        lastOrderDate: ord.createdAtFormatted || ord.createdAt,
        latestOrder: ord,
      });
    } else {
      const existing = customerMap.get(key)!;
      existing.orderCount += 1;
      // If ord is newer
      if (new Date(ord.createdAt).getTime() > new Date(existing.latestOrder.createdAt).getTime()) {
        existing.lastOrderId = ord.id;
        existing.lastOrderDate = ord.createdAtFormatted || ord.createdAt;
        existing.latestOrder = ord;
        existing.address = ord.address;
      }
    }
  });

  const customers = Array.from(customerMap.values()).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Customer Directory</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {customerMap.size} Unique Customers
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated contact records and ordering history captured through embedded forms
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No customers found matching "{search}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-4 py-3.5">Contact Mobile</th>
                  <th className="px-4 py-3.5">Delivery Address</th>
                  <th className="px-4 py-3.5 text-center">Orders</th>
                  <th className="px-4 py-3.5">Latest Order</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-100 shrink-0">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.mobile}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.address.replace(/\n/g, ', ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {c.orderCount}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                      <div>
                        <span className="font-mono text-blue-700 font-semibold mr-1.5">
                          {c.lastOrderId}
                        </span>
                        <span>{c.lastOrderDate}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectOrder(c.latestOrder)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        View Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
