import { useEffect, useMemo, useState } from 'react';
import { KEYS, readLS, writeLS } from './storage';
import type { Allocation, CashbookEntry, Client, OwnerCapitalTransaction, Session, Transaction } from './types';
import { addDays, formatDate, formatTime, normalizePhone, uid } from './utils';
import { sendLoanDisbursementSMS, sendLoanPaidOffSMS, sendPaymentReceivedSMS } from './sms';

export const USERS = [
  { email: 'william@boss.com', password: 'password123', role: 'owner' as const },
  { email: 'cashier@texas.finance', password: 'password123', role: 'staff' as const },
  { email: 'staff1@texas.finance', password: 'password123', role: 'staff' as const },
];

export const useFinanceStore = () => {
  const [clients, setClients] = useState<Client[]>(() => readLS(KEYS.clients, []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => readLS(KEYS.transactions, []));
  const [cashbook, setCashbook] = useState<CashbookEntry[]>(() => readLS(KEYS.cashbook, []));
  const [ownerCapital, setOwnerCapital] = useState<OwnerCapitalTransaction[]>(() => readLS(KEYS.owner, []));
  const [allocations, setAllocations] = useState<Allocation[]>(() => readLS(KEYS.allocations, []));
  const [session, setSession] = useState<Session | null>(() => readLS(KEYS.session, null));

  useEffect(() => writeLS(KEYS.clients, clients), [clients]);
  useEffect(() => writeLS(KEYS.transactions, transactions), [transactions]);
  useEffect(() => writeLS(KEYS.cashbook, cashbook), [cashbook]);
  useEffect(() => writeLS(KEYS.owner, ownerCapital), [ownerCapital]);
  useEffect(() => writeLS(KEYS.allocations, allocations), [allocations]);
  useEffect(() => writeLS(KEYS.session, session), [session]);

  const addClient = (payload: Omit<Client, 'id'|'processingFee'|'totalPayable'|'totalPaid'|'outstandingBalance'|'status'|'endDate'|'currentLoanNumber'|'totalLoansCompleted'>) => {
    const loanAmount = Number(payload.loanAmount);
    const totalPayable = loanAmount * 1.2;
    const now = new Date();
    const c: Client = {
      ...payload,
      id: uid(),
      phoneNumber: normalizePhone(payload.phoneNumber),
      guarantorPhone: normalizePhone(payload.guarantorPhone),
      processingFee: 10000,
      totalPayable,
      totalPaid: 0,
      outstandingBalance: totalPayable,
      endDate: addDays(payload.startDate, 30),
      status: 'Active',
      currentLoanNumber: 1,
      totalLoansCompleted: 0,
    };
    setClients((p) => [c, ...p]);
    setCashbook((p) => [
      { id: uid(), date: formatDate(now), time: formatTime(now), description: `Loan disbursement - ${c.fullName}`, type: 'Expense', amount: c.loanAmount, status: 'Disbursement', enteredBy: c.addedBy },
      { id: uid(), date: formatDate(now), time: formatTime(now), description: `Processing fee - ${c.fullName}`, type: 'Income', amount: 10000, status: 'Income', enteredBy: c.addedBy },
      ...p,
    ]);
    sendLoanDisbursementSMS(c.phoneNumber, c.fullName, c.loanAmount, c.totalPayable, c.endDate);
  };

  const recordPayment = (clientId: string, amount: number, notes: string, by: string) => {
    const now = new Date();
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    const totalPaid = Math.min(client.totalPaid + amount, client.totalPayable);
    const balance = Math.max(client.totalPayable - totalPaid, 0);
    setClients((p) => p.map((c) => c.id !== clientId ? c : {
      ...c,
      totalPaid,
      outstandingBalance: balance,
      status: balance === 0 ? 'Completed' : 'Active',
      totalLoansCompleted: balance === 0 ? c.totalLoansCompleted + 1 : c.totalLoansCompleted,
    }));
    setTransactions((p) => [{ id: uid(), clientId, clientName: client.fullName, date: formatDate(now), time: formatTime(now), amount, notes, status: 'Paid', recordedBy: by, loanNumber: client.currentLoanNumber }, ...p]);
    setCashbook((p) => [{ id: uid(), date: formatDate(now), time: formatTime(now), description: `Payment - ${client.fullName}`, type: 'Income', amount, status: 'Paid', enteredBy: by }, ...p]);
    sendPaymentReceivedSMS(client.phoneNumber, client.fullName, amount, balance);
    if (balance === 0) sendLoanPaidOffSMS(client.phoneNumber, client.fullName, totalPaid);
  };

  const issueNewLoan = (clientId: string, amount: number, by: string, startDate: string) => {
    const now = new Date();
    setClients((p) => p.map((c) => {
      if (c.id !== clientId || c.outstandingBalance > 0) return c;
      const totalPayable = amount * 1.2;
      const endDate = addDays(startDate, 30);
      sendLoanDisbursementSMS(c.phoneNumber, c.fullName, amount, totalPayable, endDate);
      return { ...c, loanAmount: amount, totalPayable, processingFee: 10000, totalPaid: 0, outstandingBalance: totalPayable, startDate, endDate, status: 'Active', currentLoanNumber: c.currentLoanNumber + 1, addedBy: by };
    }));
    const client = clients.find((x) => x.id === clientId);
    if (client?.outstandingBalance === 0) {
      setCashbook((p) => [
        { id: uid(), date: formatDate(now), time: formatTime(now), description: `Loan disbursement - ${client.fullName}`, type: 'Expense', amount, status: 'Disbursement', enteredBy: by },
        { id: uid(), date: formatDate(now), time: formatTime(now), description: `Processing fee - ${client.fullName}`, type: 'Income', amount: 10000, status: 'Income', enteredBy: by },
        ...p,
      ]);
    }
  };

  const metrics = useMemo(() => {
    const active = clients.filter((c) => c.status === 'Active');
    return {
      activeClients: active.length,
      activeLoans: active.length,
      moneyLent: active.reduce((s, c) => s + c.loanAmount, 0),
      outstanding: active.reduce((s, c) => s + c.outstandingBalance, 0),
      collected: transactions.reduce((s, t) => s + t.amount, 0),
    };
  }, [clients, transactions]);

  return {
    users: USERS,
    clients, setClients,
    transactions, setTransactions,
    cashbook, setCashbook,
    ownerCapital, setOwnerCapital,
    allocations, setAllocations,
    session, setSession,
    addClient,
    recordPayment,
    issueNewLoan,
    metrics,
  };
};
