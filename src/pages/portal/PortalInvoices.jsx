import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import KPICard from '../../components/ui/KPICard';
import { Receipt } from 'lucide-react';

export default function PortalInvoices() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await paymentService.getAll();
      setPayments(res.data || []);
    } catch (err) {
      showToast('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'invoiceNumber', 
      label: 'Reference / Invoice #',
      render: (_, row) => (
        <div>
          <span className="font-mono font-bold text-gray-900 block">{row.transactionReference || `#INV-${row.id?.substring(0, 8).toUpperCase()}`}</span>
          <span className="text-xs text-gray-400">Order: {row.order?.packageName || 'UGC Campaign'}</span>
        </div>
      )
    },
    { 
      key: 'date', 
      label: 'Date', 
      render: (_, row) => formatDate(row.paymentDate || row.createdAt) 
    },
    { 
      key: 'amount', 
      label: 'Invoice Amount', 
      render: (_, row) => <span className="font-semibold text-gray-900">{formatCurrency(row.invoiceAmount || row.amount || 0)}</span> 
    },
    { 
      key: 'received', 
      label: 'Amount Paid', 
      render: (_, row) => <span className="font-semibold text-emerald-600">{formatCurrency(row.amountReceived || row.received || 0)}</span> 
    },
    { 
      key: 'pending', 
      label: 'Pending Balance', 
      render: (_, row) => {
        const inv = parseFloat(row.invoiceAmount || row.amount || 0);
        const rec = parseFloat(row.amountReceived || row.received || 0);
        const bal = parseFloat(row.pendingBalance ?? (inv - rec));
        return <span className={`font-semibold ${bal > 0 ? 'text-amber-600' : 'text-gray-500'}`}>{formatCurrency(bal)}</span>;
      }
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (_, row) => <StatusBadge status={row.status} size="sm" /> 
    },
    { 
      key: 'method', 
      label: 'Payment Method', 
      render: (_, row) => <span className="text-xs text-gray-600 font-medium">{row.paymentMethod || row.method || 'Bank Transfer'}</span> 
    },
  ];

  const safePayments = payments || [];
  const totalInvoiced = safePayments.reduce((acc, curr) => acc + parseFloat(curr.invoiceAmount || curr.amount || 0), 0);
  const totalPaid = safePayments.reduce((acc, curr) => acc + parseFloat(curr.amountReceived || curr.received || 0), 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalPaid);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Invoices & Billing</h1>
          <p className="text-gray-500 text-xs mt-0.5">Track invoice disbursements, milestone payments, and receipts</p>
        </div>
        <div className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
          {safePayments.length} {safePayments.length === 1 ? 'Invoice' : 'Invoices'} Logged
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Invoiced</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(totalInvoiced)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">All billing milestones</p>
        </div>
        <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Total Paid</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{formatCurrency(totalPaid)}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Cleared transactions</p>
        </div>
        <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Total Outstanding</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{formatCurrency(totalOutstanding)}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">Pending milestone balance</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Invoice Ledger</h2>
        </div>
        <DataTable 
          columns={columns} 
          data={safePayments} 
          loading={loading} 
          emptyMessage="No invoices or payment receipts found." 
        />
      </div>
    </div>
  );
}
