import { toast } from 'sonner';
import { formatUGX } from './utils';

type SmsPayload = { phone: string; message: string };

const sendSimulatedSms = ({ phone, message }: SmsPayload) => {
  console.log(`[SMS to ${phone}]: ${message}`);
  if (Math.random() < 0.03) {
    toast.warning('SMS simulation failed, but operation was saved.');
    return;
  }
  toast.success('SMS simulated successfully.');
};

export const smsTemplates = {
  loanDisbursement: (name: string, amount: number, totalPayable: number, dueDate: string) => `Dear ${name},
Your loan of UGX ${amount.toLocaleString('en-UG')} has been approved!

Loan Details:
- Loan Amount: UGX ${amount.toLocaleString('en-UG')}
- Processing Fee: UGX 10,000
- Total to Repay: UGX ${totalPayable.toLocaleString('en-UG')}
- Due Date: ${dueDate}

Thank you for choosing Texas Finance!`,
  paymentReceived: (name: string, amount: number, balance: number) => `Dear ${name},
We have received your payment of UGX ${amount.toLocaleString('en-UG')}.

Your remaining balance is: UGX ${balance.toLocaleString('en-UG')}

Thank you!
- Texas Finance`,
  loanPaidOff: (name: string, totalPaid: number) => `🎉 Congratulations ${name}!
You have successfully paid off your loan!
Total Paid: UGX ${totalPaid.toLocaleString('en-UG')}

Thank you for your trust. We look forward to serving you again!
- Texas Finance`,
  balanceInquiry: (name: string, balance: number, dueDate: string) => `Dear ${name},
Your current loan balance is: UGX ${balance.toLocaleString('en-UG')}
Please ensure timely payment. Due date: ${dueDate}
- Texas Finance`,
};

export const sendLoanDisbursementSMS = (phone: string, name: string, amount: number, total: number, due: string) =>
  sendSimulatedSms({ phone, message: smsTemplates.loanDisbursement(name, amount, total, due) });

export const sendPaymentReceivedSMS = (phone: string, name: string, amount: number, balance: number) =>
  sendSimulatedSms({ phone, message: smsTemplates.paymentReceived(name, amount, balance) });

export const sendLoanPaidOffSMS = (phone: string, name: string, totalPaid: number) =>
  sendSimulatedSms({ phone, message: smsTemplates.loanPaidOff(name, totalPaid) });

export const sendBalanceInquirySMS = (phone: string, name: string, balance: number, due: string) =>
  sendSimulatedSms({ phone, message: smsTemplates.balanceInquiry(name, balance, due) });

export const notifyBalance = (name: string, balance: number) => toast.info(`${name} balance: ${formatUGX(balance)}`);
