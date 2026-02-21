import type { Allocation, CashbookEntry, Client, OwnerCapitalTransaction, Session, Transaction } from './types';

export const KEYS = {
  clients: 'texas_finance_clients',
  transactions: 'texas_finance_transactions',
  cashbook: 'texas_finance_cashbook',
  owner: 'texas_finance_owner_capital',
  allocations: 'texas_finance_allocations',
  session: 'texas_finance_auth_session',
} as const;

export const readLS = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
};

export const writeLS = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

export const getAllData = () => ({
  clients: readLS<Client[]>(KEYS.clients, []),
  transactions: readLS<Transaction[]>(KEYS.transactions, []),
  cashbook: readLS<CashbookEntry[]>(KEYS.cashbook, []),
  owner: readLS<OwnerCapitalTransaction[]>(KEYS.owner, []),
  allocations: readLS<Allocation[]>(KEYS.allocations, []),
  session: readLS<Session | null>(KEYS.session, null),
});
