import type { PropsWithChildren, ReactNode } from 'react';

export const Card = ({ children, className = '' }: PropsWithChildren<{ className?: string }>) => (
  <div className={`rounded-xl border border-white/20 bg-white/70 p-4 shadow-lg backdrop-blur ${className}`}>{children}</div>
);

export const Button = ({ children, className = '', ...props }: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
  <button className={`rounded-lg bg-violet-600 px-4 py-2 text-white transition hover:bg-violet-500 disabled:opacity-50 ${className}`} {...props}>{children}</button>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2" {...props} />;
export const Label = ({ children }: { children: ReactNode }) => <label className="text-sm font-medium text-slate-700">{children}</label>;

export const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2" {...props}>{children}</select>
);

export const Tabs = ({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (v: string) => void }) => (
  <div className="flex flex-wrap gap-2">{tabs.map((t) => <button key={t} onClick={() => onChange(t)} className={`rounded-lg px-3 py-1 text-sm ${active === t ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-700'}`}>{t}</button>)}</div>
);

export const Table = ({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) => (
  <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{headers.map((h) => <th className="px-2 py-2 text-left" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr className="border-t" key={i}>{r.map((c, ci) => <td className="px-2 py-2" key={ci}>{c}</td>)}</tr>)}</tbody></table></div>
);

export const Dialog = ({ open, onClose, title, children }: PropsWithChildren<{ open: boolean; onClose: () => void; title: string }>) =>
  !open ? null : <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"><div className="w-full max-w-lg rounded-xl bg-white p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">{title}</h3><button onClick={onClose}>✕</button></div>{children}</div></div>;
