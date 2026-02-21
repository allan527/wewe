import { createContext, useContext, useMemo, useState } from 'react';
import { Link, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Bell, LayoutDashboard, Users, Wallet } from 'lucide-react';
import { useFinanceStore } from './lib/useFinanceStore';
import { formatUGX, formatDate, normalizePhone } from './lib/utils';
import { sendBalanceInquirySMS } from './lib/sms';
import { Button, Card, Dialog, Input, Label, Select, Table, Tabs } from './components/ui/primitives';

const Ctx = createContext<ReturnType<typeof useFinanceStore> | null>(null);
const useApp = () => useContext(Ctx)!;

const nav = [
  ['/', 'Dashboard', LayoutDashboard], ['/clients', 'Clients', Users], ['/loans', 'Loans', Wallet], ['/transactions', 'Transactions', Bell], ['/cashbook', 'Cashbook', Bell], ['/owner-capital', 'Owner Capital', Bell], ['/evaluation', 'Evaluation', Bell], ['/data-view', 'Data View', Bell], ['/client-allocation', 'Client Allocation', Bell],
];

const Layout = () => {
  const { session, setSession } = useApp();
  if (!session) return <Navigate to="/login" replace />;
  return <div className="min-h-screen bg-gradient-to-br from-slate-100 to-violet-100 font-sans"><div className="flex"><aside className="min-h-screen w-64 bg-slate-800 p-4 text-white"><h1 className="mb-6 text-xl font-bold">Texas Finance</h1><div className="space-y-2">{nav.map(([path, name, Icon]) => (path === '/data-view' || path === '/client-allocation') && session.role !== 'owner' ? null : <Link key={path} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-violet-600" to={path}><Icon size={16} />{name}</Link>)}</div><Button className="mt-6 w-full bg-slate-600" onClick={() => setSession(null)}>Logout</Button></aside><main className="flex-1 p-4"><Outlet /></main></div></div>;
};

const Login = () => {
  const { users, session, setSession } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState('william@boss.com');
  const [password, setPassword] = useState('password123');
  if (session) return <Navigate to="/" replace />;
  return <div className="grid min-h-screen place-items-center bg-slate-950 p-4"><Card className="w-full max-w-md"><h2 className="mb-4 text-2xl font-bold">Login</h2><div className="space-y-3"><div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div><div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div><Button className="w-full" onClick={() => { const u = users.find((x) => x.email === email && x.password === password); if (!u) return toast.error('Invalid credentials'); setSession({ email: u.email, role: u.role }); toast.success(`Logged in as ${u.role}`); nav('/'); }}>Sign In</Button></div></Card></div>;
};

const Dashboard = () => {
  const { metrics, transactions, cashbook } = useApp();
  const [tab, setTab] = useState('Today');
  const kpis = [['Active Clients', metrics.activeClients], ['Total Active Loans', metrics.activeLoans], ['Total Money Lent', formatUGX(metrics.moneyLent)], ['Outstanding Balance', formatUGX(metrics.outstanding)], ['Money Collected', formatUGX(metrics.collected)]];
  return <div className="space-y-4"><h2 className="text-2xl font-semibold">Dashboard</h2><div className="grid gap-3 md:grid-cols-5">{kpis.map(([k, v]) => <Card key={k as string} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"><p>{k}</p><h3 className="text-xl font-bold">{v}</h3></Card>)}</div><Tabs tabs={['Today', 'This Week', 'This Month']} active={tab} onChange={setTab} /><Card><h3 className="mb-2 font-semibold">Recent Payments</h3><Table headers={['Client', 'Date', 'Amount']} rows={transactions.slice(0, 5).map((t) => [<Link className="text-violet-600" to={`/clients/${t.clientId}`}>{t.clientName}</Link>, t.date, formatUGX(t.amount)])} /></Card><Card><h3 className="mb-2 font-semibold">Recent Disbursements</h3><Table headers={['Description', 'Date', 'Amount']} rows={cashbook.filter((c) => c.status === 'Disbursement').slice(0, 5).map((c) => [c.description, c.date, formatUGX(c.amount)])} /></Card></div>;
};

const Clients = () => {
  const { clients, addClient, session } = useApp();
  const [tab, setTab] = useState('All');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading] = useState(false);
  const filtered = clients.filter((c) => (tab === 'All' || c.status === tab) && `${c.fullName}${c.phoneNumber}${c.nationalId}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">Clients</h2><Button onClick={() => setOpen(true)}>Add Client</Button></div><Input placeholder="Search name/phone/ID" value={q} onChange={(e) => setQ(e.target.value)} /><Tabs tabs={['All', 'Active', 'Completed']} active={tab} onChange={setTab} />{loading ? <Card>Loading...</Card> : <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{filtered.map((c) => <Card key={c.id}><div className="mb-2 flex items-center justify-between"><h3 className="font-semibold">{c.fullName}</h3><span className="rounded bg-slate-200 px-2 py-1 text-xs">{c.status}</span></div><p>{formatUGX(c.totalPaid)} / {formatUGX(c.totalPayable)}</p><div className="mt-2 h-2 rounded bg-slate-200"><div className="h-2 rounded bg-violet-600" style={{ width: `${(c.totalPaid / c.totalPayable) * 100}%` }} /></div><Link to={`/clients/${c.id}`} className="mt-3 inline-block text-violet-700">View Details</Link>{session?.role === 'owner' && <span className="ml-2 text-xs">Edit</span>}</Card>)}</div>}
    <AddClientDialog open={open} onClose={() => setOpen(false)} onSave={addClient} user={session?.email ?? ''} />
  </div>;
};

const AddClientDialog = ({ open, onClose, onSave, user }: any) => {
  const [f, setF] = useState<any>({ fullName: '', phoneNumber: '', nationalId: '', location: '', guarantorName: '', guarantorId: '', guarantorPhone: '', guarantorLocation: '', loanAmount: 0, startDate: formatDate(new Date()) });
  return <Dialog open={open} onClose={onClose} title="Add Client"><div className="grid gap-2">{Object.keys(f).map((k) => <Input key={k} type={k === 'loanAmount' ? 'number' : 'text'} placeholder={k} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />)}<Button onClick={() => { try { onSave({ ...f, addedBy: user, phoneNumber: normalizePhone(f.phoneNumber), guarantorPhone: normalizePhone(f.guarantorPhone), loanAmount: Number(f.loanAmount) }); toast.success('Client added'); onClose(); } catch (e: any) { toast.error(e.message); } }}>Save</Button></div></Dialog>;
};

const ClientDetail = () => {
  const { id = '' } = useParams();
  const { clients, transactions, recordPayment, issueNewLoan, session, senders } = (useApp() as any);
  const c = clients.find((x) => x.id === id);
  const [payOpen, setPayOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [amt, setAmt] = useState(0);
  const [tab, setTab] = useState('Overview');
  if (!c) return <Card>Client not found.</Card>;
  return <div className="space-y-3"><Link to="/clients" className="text-violet-700">← Back</Link><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-semibold">{c.fullName}</h2><span className="rounded bg-slate-200 px-2 py-1 text-xs">{c.status}</span><Button onClick={() => setPayOpen(true)}>Record Payment</Button><Button onClick={() => setLoanOpen(true)}>Issue New Loan</Button>{session?.role === 'owner' && <Button onClick={() => sendBalanceInquirySMS(c.phoneNumber, c.fullName, c.outstandingBalance, c.endDate)}>Send Balance Inquiry SMS</Button>}</div><Tabs tabs={['Overview', 'Payment History', 'Loan History']} active={tab} onChange={setTab} />{tab === 'Overview' && <Card><p>Phone: {c.phoneNumber}</p><p>Outstanding: {formatUGX(c.outstandingBalance)}</p><p>Guarantor: {c.guarantorName}</p><div className="mt-2 h-2 rounded bg-slate-200"><div className="h-2 rounded bg-emerald-500" style={{ width: `${(c.totalPaid / c.totalPayable) * 100}%` }} /></div></Card>}{tab === 'Payment History' && <Card><Table headers={['Date', 'Amount', 'Notes']} rows={transactions.filter((t) => t.clientId === c.id).map((t) => [t.date, formatUGX(t.amount), t.notes])} /></Card>}{tab === 'Loan History' && <Card><p>Loan #{c.currentLoanNumber}</p><p>Current amount: {formatUGX(c.loanAmount)}</p></Card>}<Dialog open={payOpen} onClose={() => setPayOpen(false)} title="Record payment"><Input type="number" value={amt} onChange={(e) => setAmt(Number(e.target.value))} /><Button onClick={() => { recordPayment(c.id, amt, 'Manual payment', session!.email); setPayOpen(false); toast.success('Payment recorded'); }}>Save</Button></Dialog><Dialog open={loanOpen} onClose={() => setLoanOpen(false)} title="Issue new loan"><Input type="number" value={amt} onChange={(e) => setAmt(Number(e.target.value))} /><Button onClick={() => { issueNewLoan(c.id, amt, session!.email, formatDate(new Date())); toast.success('Loan issued if eligible'); setLoanOpen(false); }}>Issue</Button></Dialog></div>;
};

const SimpleTablePage = ({ title, headers, rows, extra }: any) => <div className="space-y-3"><h2 className="text-2xl font-semibold">{title}</h2>{extra}<Card><Table headers={headers} rows={rows} /></Card></div>;

export const AppRouterViews = {
  Layout, Login, Dashboard, Clients, ClientDetail,
  Loans: () => {
    const { clients } = useApp();
    const [tab, setTab] = useState('All');
    const list = clients.filter((c) => tab === 'All' || c.status === tab);
    return <SimpleTablePage title="Loans" extra={<Tabs tabs={['All', 'Active', 'Completed']} active={tab} onChange={setTab} />} headers={['Client', 'Loan', 'Outstanding', 'Status']} rows={list.map((c) => [<Link to={`/clients/${c.id}`} className="text-violet-600">{c.fullName}</Link>, formatUGX(c.loanAmount), formatUGX(c.outstandingBalance), c.status])} />;
  },
  Transactions: () => {
    const { transactions, session, setTransactions } = useApp();
    const [q, setQ] = useState('');
    const rows = transactions.filter((t) => t.clientName.toLowerCase().includes(q.toLowerCase())).map((t) => [t.clientName, t.date, formatUGX(t.amount), t.notes, <button onClick={() => window.print()}>Receipt</button>, session?.role === 'owner' ? <button onClick={() => setTransactions((p) => p.filter((x) => x.id !== t.id))}>Delete</button> : '-']);
    return <SimpleTablePage title="Transactions" extra={<div className="flex gap-2"><Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /><Button onClick={() => { const csv = ['client,date,amount,notes', ...transactions.map((t) => `${t.clientName},${t.date},${t.amount},${t.notes}`)].join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'transactions.csv'; a.click(); }}>Export CSV</Button></div>} headers={['Client', 'Date', 'Amount', 'Notes', 'Receipt', 'Action']} rows={rows} />;
  },
  Cashbook: () => {
    const { cashbook, setCashbook, session } = useApp();
    const [open, setOpen] = useState(false);
    const [f, setF] = useState({ description: '', type: 'Income', amount: 0 });
    const income = cashbook.filter((x) => x.type === 'Income').reduce((s, x) => s + x.amount, 0);
    const expense = cashbook.filter((x) => x.type === 'Expense').reduce((s, x) => s + x.amount, 0);
    return <div className="space-y-3"><h2 className="text-2xl font-semibold">Cashbook</h2><div className="grid gap-2 md:grid-cols-3"><Card>Income: {formatUGX(income)}</Card><Card>Expenses: {formatUGX(expense)}</Card><Card>Net: {formatUGX(income - expense)}</Card></div><Button onClick={() => setOpen(true)}>Add Entry</Button><Card><Table headers={['Date', 'Description', 'Type', 'Amount', 'Status']} rows={cashbook.map((c) => [c.date, c.description, c.type, formatUGX(c.amount), c.status])} /></Card><Dialog open={open} onClose={() => setOpen(false)} title="Add cashbook entry"><Input placeholder="Description" onChange={(e) => setF({ ...f, description: e.target.value })} /><Select onChange={(e) => setF({ ...f, type: e.target.value as any })}><option>Income</option><option>Expense</option></Select><Input type="number" onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} /><Button onClick={() => { const now = new Date(); setCashbook((p) => [{ id: crypto.randomUUID(), date: formatDate(now), time: now.toLocaleTimeString(), description: f.description, type: f.type as any, amount: f.amount, status: f.type as any, enteredBy: session!.email }, ...p]); setOpen(false); }}>Save</Button></Dialog></div>;
  },
  OwnerCapital: () => {
    const { ownerCapital, setOwnerCapital, setCashbook, session } = useApp();
    const [type, setType] = useState<'Injection'|'Withdrawal'>('Injection'); const [amount, setAmount] = useState(0); const [notes, setNotes] = useState('');
    return <div className="space-y-3"><h2 className="text-2xl font-semibold">Owner Capital</h2><Button onClick={() => { const now = new Date(); setOwnerCapital((p) => [{ id: crypto.randomUUID(), date: formatDate(now), time: now.toLocaleTimeString(), type, amount, notes, recordedBy: session!.email }, ...p]); setCashbook((p) => [{ id: crypto.randomUUID(), date: formatDate(now), time: now.toLocaleTimeString(), description: `Owner Capital ${type} - ${notes}`, type: type === 'Injection' ? 'Income' : 'Expense', amount, status: type === 'Injection' ? 'Income' : 'Expense', enteredBy: session!.email }, ...p]); }}>Add</Button><div className="grid gap-2 md:grid-cols-3"><Select onChange={(e) => setType(e.target.value as any)}><option>Injection</option><option>Withdrawal</option></Select><Input type="number" onChange={(e) => setAmount(Number(e.target.value))} /><Input placeholder="Notes" onChange={(e) => setNotes(e.target.value)} /></div><Card><Table headers={['Date', 'Type', 'Amount', 'Notes', 'Action']} rows={ownerCapital.map((o) => [o.date, o.type, formatUGX(o.amount), o.notes, session?.role === 'owner' ? <button onClick={() => setOwnerCapital((p) => p.filter((x) => x.id !== o.id))}>Delete</button> : '-'])} /></Card></div>;
  },
  Evaluation: () => {
    const { cashbook, transactions } = useApp();
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() - today.getDay() + i); return d; });
    return <SimpleTablePage title="Evaluation" headers={['Day', 'Payments', 'Expenses', 'Amount Loaned', 'Income', 'Net', 'Txns', 'Date']} rows={days.map((d) => { const key = formatDate(d); const pay = transactions.filter((t) => t.date === key).reduce((s, x) => s + x.amount, 0); const exp = cashbook.filter((c) => c.date === key && c.type === 'Expense' && c.status !== 'Disbursement').reduce((s, x) => s + x.amount, 0); const loaned = cashbook.filter((c) => c.date === key && c.status === 'Disbursement').reduce((s, x) => s + x.amount, 0); const inc = cashbook.filter((c) => c.date === key && c.type === 'Income').reduce((s, x) => s + x.amount, 0); return [d.toLocaleDateString('en-US', { weekday: 'short' }), formatUGX(pay), formatUGX(exp), formatUGX(loaned), formatUGX(inc), formatUGX(inc - exp), `${transactions.filter((t) => t.date === key).length}`, key]; })} />;
  },
  DataView: () => {
    const { session, clients, transactions, cashbook, ownerCapital, setClients, setTransactions, setCashbook, setOwnerCapital } = useApp();
    if (session?.role !== 'owner') return <Navigate to="/" replace />;
    return <div className="space-y-3"><h2 className="text-2xl">Data View</h2><Tabs tabs={['Clients', 'Transactions', 'Cashbook', 'Owner Capital']} active={'Clients'} onChange={() => {}} /><Card><p>Full CRUD for raw records:</p><Button onClick={() => { if (confirm('Delete all data?')) { setClients([]); setTransactions([]); setCashbook([]); setOwnerCapital([]); } }}>Delete All</Button><p>{clients.length} clients, {transactions.length} txns, {cashbook.length} cashbook, {ownerCapital.length} owner capital.</p></Card></div>;
  },
  ClientAllocation: () => {
    const { session, clients, allocations, setAllocations, users } = useApp();
    if (session?.role !== 'owner') return <Navigate to="/" replace />;
    return <div className="space-y-3"><h2 className="text-2xl">Client Allocation</h2><Card>{clients.map((c) => <div key={c.id} className="mb-2 flex items-center justify-between"><span>{c.fullName}</span><Select value={allocations.find((a) => a.clientId === c.id)?.assignedTo ?? ''} onChange={(e) => setAllocations((p) => [...p.filter((x) => x.clientId !== c.id), { clientId: c.id, assignedTo: e.target.value }])}><option value="">Unassigned</option>{users.filter((u) => u.role === 'staff').map((u) => <option key={u.email} value={u.email}>{u.email}</option>)}</Select></div>)}</Card></div>;
  },
};

export const AppRoot = () => {
  const store = useFinanceStore();
  return <Ctx.Provider value={store}><Outlet /></Ctx.Provider>;
};
