export type Role = 'owner' | 'staff';

export type Client = {
  id: string;
  fullName: string;
  phoneNumber: string;
  nationalId: string;
  location: string;
  guarantorName: string;
  guarantorId: string;
  guarantorPhone: string;
  guarantorLocation: string;
  loanAmount: number;
  processingFee: number;
  totalPayable: number;
  totalPaid: number;
  outstandingBalance: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed';
  addedBy: string;
  currentLoanNumber: number;
  totalLoansCompleted: number;
};

export type Transaction = {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  amount: number;
  notes: string;
  status: 'Paid';
  recordedBy: string;
  loanNumber: number;
};

export type CashbookEntry = {
  id: string;
  date: string;
  time: string;
  description: string;
  type: 'Income' | 'Expense';
  amount: number;
  status: 'Paid' | 'Disbursement' | 'Expense' | 'Income';
  enteredBy: string;
};

export type OwnerCapitalTransaction = {
  id: string;
  date: string;
  time: string;
  type: 'Injection' | 'Withdrawal';
  amount: number;
  notes: string;
  recordedBy: string;
};

export type Allocation = { clientId: string; assignedTo: string };

export type Session = { email: string; role: Role };
