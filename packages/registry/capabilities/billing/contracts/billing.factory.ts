import type { ICustomerRepository } from "../application/ports/customer-repository.port.js";
import type { ISubscriptionRepository } from "../application/ports/subscription-repository.port.js";
import type { IInvoiceRepository } from "../application/ports/invoice-repository.port.js";
import type { IPaymentProvider } from "../application/ports/payment-provider.port.js";
import { CreateSubscription } from "../application/use-cases/create-subscription.use-case.js";
import { CancelSubscription } from "../application/use-cases/cancel-subscription.use-case.js";
import { ChangeSubscriptionPlan } from "../application/use-cases/change-subscription-plan.use-case.js";
import { GetSubscription } from "../application/use-cases/get-subscription.use-case.js";
import { ProcessPayment } from "../application/use-cases/process-payment.use-case.js";
import { RefundPayment } from "../application/use-cases/refund-payment.use-case.js";
import { GetPaymentHistory } from "../application/use-cases/get-payment-history.use-case.js";
import { GenerateInvoice } from "../application/use-cases/generate-invoice.use-case.js";
import { GetInvoice } from "../application/use-cases/get-invoice.use-case.js";
import { ListInvoices } from "../application/use-cases/list-invoices.use-case.js";
import type { IBillingService } from "./billing.contract.js";

export type BillingServiceDeps = {
  customerRepository: ICustomerRepository;
  subscriptionRepository: ISubscriptionRepository;
  invoiceRepository: IInvoiceRepository;
  paymentProvider: IPaymentProvider;
};

export function createBillingService(deps: BillingServiceDeps): IBillingService {
  const createSubscription = new CreateSubscription(deps.customerRepository, deps.subscriptionRepository, deps.paymentProvider);
  const cancelSubscription = new CancelSubscription(deps.subscriptionRepository, deps.paymentProvider);
  const changeSubscriptionPlan = new ChangeSubscriptionPlan(deps.subscriptionRepository);
  const getSubscription = new GetSubscription(deps.subscriptionRepository);
  const processPayment = new ProcessPayment(deps.customerRepository, deps.paymentProvider);
  const refundPayment = new RefundPayment(deps.paymentProvider);
  const getPaymentHistory = new GetPaymentHistory(deps.customerRepository, deps.invoiceRepository);
  const generateInvoice = new GenerateInvoice(deps.customerRepository, deps.invoiceRepository);
  const getInvoice = new GetInvoice(deps.invoiceRepository);
  const listInvoices = new ListInvoices(deps.customerRepository, deps.invoiceRepository);

  return {
    createSubscription: (input) => createSubscription.execute(input),
    cancelSubscription: (input) => cancelSubscription.execute(input),
    changeSubscriptionPlan: (input) => changeSubscriptionPlan.execute(input),
    getSubscription: (id) => getSubscription.execute(id),
    processPayment: (input) => processPayment.execute(input),
    refundPayment: (input) => refundPayment.execute(input),
    getPaymentHistory: (customerId) => getPaymentHistory.execute(customerId),
    generateInvoice: (input) => generateInvoice.execute(input),
    getInvoice: (id) => getInvoice.execute(id),
    listInvoices: (customerId) => listInvoices.execute(customerId),
  };
}
