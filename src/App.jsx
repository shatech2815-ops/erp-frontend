import React from 'react';
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SubItemsPage from './pages/SubItemsPage';
import LoginPage from "./pages/LoginPage";

import POList          from './pages/purchase/POList';
import CreatePO        from './pages/purchase/CreatePO';
import POStatusTracker from './pages/purchase/POStatusTracker';
import CreateSupplierPO from './pages/purchase/CreateSupplierPO';
import SupplierPOList   from './pages/purchase/SupplierPOList';
import PurchaseVendorList from './pages/purchase/PurchaseVendorList';
import PurchaseAddVendor  from './pages/purchase/PurchaseAddVendor';
import ItemCatalog     from './pages/purchase/ItemCatalog';
import StockLevels     from './pages/purchase/StockLevels';
import ItemRequests    from './pages/purchase/ItemRequests';
import PurchaseReports from './pages/purchase/PurchaseReports';

import PurchaseOrdersFrontPage    from './pages/purchase/PurchaseOrdersFrontPage';
import PurchaseVendorsFrontPage   from './pages/purchase/PurchaseVendorsFrontPage';
import PurchaseInventoryFrontPage from './pages/purchase/PurchaseInventoryFrontPage';
import RequisitionsFrontPage      from './pages/purchase/RequisitionsFrontPage';
import PurchaseSettingsFrontPage  from './pages/purchase/settings/PurchaseSettingsFrontPage'

import RFQList from './pages/purchase/RFQList';
import CreateRFQ from './pages/purchase/CreateRFQ';
import GRNList from './pages/purchase/GRNList';
import CreateGRN from './pages/purchase/CreateGRN';
import QuotationComparison from './pages/purchase/QuotationComparison';


import VendorRegistration from './pages/vendor/VendorRegistration';
import VendorList         from './pages/vendor/VendorList';
import VendorProfile      from './pages/vendor/VendorProfile';
import VendorCategories   from './pages/vendor/VendorCategories';
import AddContract        from './pages/vendor/AddContract';
import ContractList       from './pages/vendor/ContractList';
import ContractTemplates  from './pages/vendor/ContractTemplates';
import GenerateInvoice    from './pages/vendor/GenerateInvoice';
import InvoiceList        from './pages/vendor/InvoiceList';
import InvoiceView from './pages/vendor/InvoiceView';
import PaymentHistory     from './pages/vendor/PaymentHistory';
import VendorPerformance  from './pages/vendor/VendorPerformance';
import VendorReports      from './pages/vendor/VendorReports';
import VendorSettings     from './pages/vendor/VendorSettings';

import VendorPerformanceFrontPage from './pages/vendor/VendorPerformanceFrontPage';
import VendorsFrontPage        from './pages/vendor/VendorsFrontPage';
import ContractsFrontPage      from './pages/vendor/ContractsFrontPage';
import VendorInvoicesFrontPage from './pages/vendor/VendorInvoicesFrontPage';
import VendorReportsFrontPage  from './pages/vendor/VendorReportsFrontPage';
import VendorSettingsFrontPage from './pages/vendor/VendorSettingsFrontPage';

import DeliveryChallanList from './pages/vendor/DeliveryChallanList';
import QuotationList from './pages/vendor/QuotationList';
import CreditNoteList from './pages/vendor/CreditNoteList';
import DebitNoteList from './pages/vendor/DebitNoteList';

import DeliveryChallanDetail from './pages/vendor/DeliveryChallanDetail';
import QuotationDetail       from './pages/vendor/QuotationDetail';
import CreditNoteDetail      from './pages/vendor/CreditNoteDetail';
import DebitNoteDetail       from './pages/vendor/DebitNoteDetail';


import Inventory            from './pages/stock/Inventory';
import ItemsPage            from './pages/stock/ItemsPage';
import StockLevelPage       from './pages/stock/StockLevelPage';
import StockAdjustmentPage  from './pages/stock/StockAdjustmentPage';
import StockTransferPage    from './pages/stock/StockTransferPage';
import StockAlertsPage      from './pages/stock/StockAlertsPage';
import ItemCatalogPage      from './pages/stock/ItemCatalogPage';
import ItemListPage         from './pages/stock/ItemListPage';
import AddNewItemPage       from './pages/stock/AddNewItemPage';
import ItemCategoriesPage   from './pages/stock/ItemCategoriesPage';
import BillOfMaterialsPage  from './pages/stock/BillOfMaterialsPage';

import WarehouseListPage      from './pages/stock/warehouse/WarehouseListPage';
import AddWarehousePage       from './pages/stock/warehouse/AddWarehousePage';
import LocationMappingPage    from './pages/stock/warehouse/LocationMappingPage';
import InventoryCountsPage    from './pages/stock/warehouse/InventoryCountsPage';

import ProductionPlanningPage    from './pages/stock/production/ProductionPlanningPage';
import WorkOrdersPage            from './pages/stock/production/WorkOrdersPage';
import ProductionSchedulingPage  from './pages/stock/production/ProductionSchedulingPage';
import MrpPage                   from './pages/stock/production/MrpPage';

import StockReportsPage          from './pages/stock/reports/StockReportsPage';
import StockReportPage           from './pages/stock/reports/StockReportPage';
import InventoryReportPage       from './pages/stock/reports/InventoryReportPage';
import StockMovementReportPage   from './pages/stock/reports/StockMovementReportPage';
import ProductionReportPage      from './pages/stock/reports/ProductionReportPage';
import InventoryValuationReportPage from './pages/stock/reports/InventoryValuationReportPage';
import InventoryAccuracyReportPage  from './pages/stock/reports/InventoryAccuracyReportPage';
import SlowMovingItemsReportPage    from './pages/stock/reports/SlowMovingItemsReportPage';

import StockSettingsPage         from './pages/stock/settings/StockSettingsPage';
import UOMManagementPage         from './pages/stock/settings/UOMManagementPage';
import InventorySettingsPage     from './pages/stock/settings/InventorySettingsPage';

import WarehousePage from './pages/stock/warehouse/WarehouseFrontPage';
import ProductionPage from './pages/stock/production/ProductionFrontPage';

import ClientFrontPage from "./pages/client/ClientFrontPage";
import ClientList       from './pages/client/ClientList';
import AddClient        from './pages/client/AddClient';
import ClientCategories from './pages/client/ClientCategories';
import ClientContacts   from './pages/client/ClientContacts';

import LeadFrontPage from "./pages/client/LeadFrontPage";
import AddNewLead from "./pages/client/AddNewLead";
import LeadList from "./pages/client/LeadList";
import LeadSource from "./pages/client/LeadSource";
import LeadConversion from "./pages/client/LeadConversion";

import OpportunityFrontPage from "./pages/client/OpportunityFrontPage";
import AddNewOpportunity from "./pages/client/AddNewOpportunity";
import OpportunityList from "./pages/client/OpportunityList";
import SalesPipeline from "./pages/client/SalesPipeline";
import QuotationManagement from "./pages/client/QuotationManagement";
import AddQuotation from "./pages/client/AddQuotation";

import OrderFrontPage from "./pages/client/OrderFrontPage";
import CreateOrder from "./pages/client/CreateOrder";
import EditOrder from "./pages/client/EditOrder";
import OrderList from "./pages/client/OrderList";
import OrderStatus from "./pages/client/OrderStatus";
import DeliverySchedule from "./pages/client/DeliverySchedule";

import ServiceFrontPage from "./pages/client/ServiceFrontPage";
import ServiceRequest from "./pages/client/ServiceRequest";
import ServiceHistory from "./pages/client/ServiceHistory";
import WarrantyManagement from "./pages/client/WarrantyManagement";
import Complaints from "./pages/client/Complaints";

import ReportsFrontPage from "./pages/client/ReportsFrontPage";
import ClientReport from "./pages/client/ClientReport";
import SalesReport from "./pages/client/SalesReport";
import OrderReport from "./pages/client/OrderReport";
import ClientFeedbackReport from "./pages/client/ClientFeedbackReport";

import FinancialsDashboard from './pages/accounts/FinancialsDashboard';
import GeneralLedger       from './pages/accounts/GeneralLedger';
import TrialBalance        from './pages/accounts/TrialBalance';
import FinancialReports    from './pages/accounts/FinancialReports';
import InvoiceListAccounts        from './pages/accounts/AccountInvoiceList';
import CreateInvoice       from './pages/accounts/CreateInvoice';
import InvoiceTracking     from './pages/accounts/InvoiceTracking';
import PaymentReceipts     from './pages/accounts/PaymentReceipts';
import PaymentList         from './pages/accounts/PaymentList';
import MakePayment         from './pages/accounts/MakePayment';
import PaymentModes        from './pages/accounts/PaymentModes';
import BankReconciliation  from './pages/accounts/BankReconciliation';
import CostCenters from './pages/accounts/CostCenters';
import Budgets     from './pages/accounts/Budgets';
import EmployeeAdvances from './pages/accounts/EmployeeAdvances';
import FixedAssets      from './pages/accounts/FixedAssets';
import JournalEntries   from './pages/accounts/JournalEntries';
import ExpenseList         from './pages/accounts/ExpenseList';
import AddExpense          from './pages/accounts/AddExpense';
import ExpenseCategories   from './pages/accounts/ExpenseCategories';
import ExpenseReports      from './pages/accounts/ExpenseReports';
import AccountVendorList   from './pages/accounts/AccountVendorList';
import AddAccountVendor    from './pages/accounts/AddAccountVendor';
import VendorPayments      from './pages/accounts/VendorPayments';
import VendorInvoices      from './pages/accounts/VendorInvoices';
import AccountsReports     from './pages/accounts/AccountsReports';
import ProfitLossReport    from './pages/accounts/ProfitLossReport';
import BalanceSheet        from './pages/accounts/BalanceSheet';
import CashFlowReport      from './pages/accounts/CashFlowReport';
import GstReport           from './pages/accounts/GstReport';

import FinancialsFrontPage        from './pages/accounts/FinancialsFrontPage';
import InvoicesFrontPage          from './pages/accounts/InvoicesFrontPage';
import PaymentsFrontPage          from './pages/accounts/PaymentsFrontPage';
import ExpensesFrontPage          from './pages/accounts/ExpensesFrontPage';
import AccountVendorsFrontPage    from './pages/accounts/AccountVendorsFrontPage';

import StockBalances from './pages/stock/StockBalances';
import StockMovements from './pages/stock/StockMovements';
import StockReceipt from './pages/stock/StockReceipt';
import StockIssue from './pages/stock/StockIssue';
import StockTransfer from './pages/stock/StockTransfer';
import QualityInspection from './pages/stock/QualityInspection';
import PickList from './pages/stock/PickList';
import StockCount from './pages/stock/StockCount';
import StockReturns from './pages/stock/StockReturns';
import LowStockAlerts from './pages/stock/LowStockAlerts';
import InventoryTestingFlow from './pages/stock/InventoryTestingFlow';


import RequisitionList    from './pages/purchase/RequisitionList';
import NewRequisition     from './pages/purchase/NewRequisition';
import ApprovalWorkflow   from './pages/purchase/ApprovalWorkflow';

import POReport              from './pages/purchase/POReport';
import VendorPerformanceReport from './pages/purchase/VendorPerformanceReport';
import InventoryReport       from './pages/purchase/InventoryReport';

import ApprovalMatrix           from './pages/purchase/settings/ApprovalMatrix';
import POTemplates              from './pages/purchase/settings/POTemplates';
import PurchaseVendorCategories from './pages/purchase/settings/PurchaseVendorCategories';

import ManageWebhooks from './pages/webhooks/ManageWebhooks';
import WebhookLogs from './pages/webhooks/WebhookLogs';
import NotificationsPage from './pages/NotificationsPage';
import { NotificationProvider } from './context/NotificationContext';
import SystemSettingsPage from './pages/SystemSettingsPage';

function App() {
  return (   
    <NotificationProvider>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/*" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SystemSettingsPage />} />

          <Route path="purchase"                                   element={<SubItemsPage moduleKey="purchase" />} />
          <Route path="purchase/purchase-orders"                    element={<PurchaseOrdersFrontPage />} />
          <Route path="purchase/purchase-orders/po-list"           element={<POList />} />
          <Route path="purchase/purchase-orders/create-po"         element={<CreatePO />} />
          <Route path="purchase/purchase-orders/po-status-tracker" element={<POStatusTracker />} />
          <Route path="purchase/purchase-orders/create-supplier-po" element={<CreateSupplierPO />} />
          <Route path="purchase/purchase-orders/supplier-po-list"   element={<SupplierPOList />} />
          <Route path="purchase/vendors"                           element={<PurchaseVendorsFrontPage />} />
          <Route path="purchase/inventory"                        element={<PurchaseInventoryFrontPage />} />
          <Route path="purchase/requisitions"                     element={<RequisitionsFrontPage />} />
          <Route path="purchase/vendors/list"                      element={<PurchaseVendorList />} />
          <Route path="purchase/vendors/add"                       element={<PurchaseAddVendor />} />
          <Route path="purchase/vendors/categories"                element={<VendorCategories />} />
          <Route path="purchase/reports"                           element={<PurchaseReports />} />
          <Route path="purchase/inventory/item-catalog"            element={<ItemCatalog />} />
          <Route path="purchase/inventory/stock-levels"            element={<StockLevels />} />
          <Route path="purchase/inventory/item-requests"           element={<ItemRequests />} />
          <Route path="purchase/reports/po-reports"                element={<POReport />} />
          <Route path="purchase/reports/vendor-performance"        element={<VendorPerformanceReport />} />
          <Route path="purchase/reports/inventory-report"          element={<InventoryReport />} />
          <Route path="purchase/requisitions/req-list"             element={<RequisitionList />} />
          <Route path="purchase/requisitions/new-requisition"      element={<NewRequisition />} />
          <Route path="purchase/requisitions/approval-workflow"    element={<ApprovalWorkflow />} />

          <Route path="purchase/rfqs"                              element={<RFQList />} />
          <Route path="purchase/rfqs/rfq-list"                     element={<RFQList />} />
          <Route path="purchase/create-rfq"                        element={<CreateRFQ />} />
          <Route path="purchase/quotations"                        element={<QuotationComparison />} />
          <Route path="purchase/quotations/comparison"             element={<QuotationComparison />} />

          <Route path="purchase/grn-list"                          element={<GRNList />} />
          <Route path="purchase/create-grn"                        element={<CreateGRN />} />
          <Route path="purchase/settings"                          element={<PurchaseSettingsFrontPage />} />
          <Route path="purchase/settings/approval-matrix"          element={<ApprovalMatrix />} />
          <Route path="purchase/settings/po-templates"             element={<POTemplates />} />
          <Route path="purchase/settings/vendor-categories"        element={<PurchaseVendorCategories />} />
          <Route path="purchase/:sectionId"                        element={<SubItemsPage moduleKey="purchase" />} />

          {/* ── Vendor Management ── */}
          <Route path="vendor"                              element={<SubItemsPage moduleKey="vendor" />} />
          <Route path="vendor/vendors"                      element={<VendorsFrontPage />} />
          <Route path="vendor/vendors/add"                  element={<VendorRegistration />} />
          <Route path="vendor/vendors/list"                 element={<VendorList />} />
          <Route path="vendor/vendors/:id"                  element={<VendorProfile />} />
          <Route path="vendor/vendors/categories"           element={<VendorCategories />} />
           <Route path="vendor/contracts"                   element={<ContractsFrontPage />} />
          <Route path="vendor/contracts/add"                element={<AddContract />} />
          <Route path="vendor/contracts/list"               element={<ContractList />} />
          <Route path="vendor/contracts/templates"          element={<ContractTemplates />} />
           <Route path="vendor/invoices"                    element={<VendorInvoicesFrontPage />} />
          <Route path="vendor/invoices/generate"            element={<GenerateInvoice />} />
          <Route path="vendor/invoices/list"                element={<InvoiceList />} />
           <Route path="vendor/invoices/:id"      element={<InvoiceView />} />
          <Route path="accounts/invoices/:id"    element={<InvoiceView context={{ moduleBase: '/dashboard/accounts', moduleLabel: 'Accounts Management', listPath: '/dashboard/accounts/invoices/list' }} />} />
          <Route path="vendor/invoices/payments"            element={<PaymentHistory />} />
          <Route path="vendor/performance"                   element={<VendorPerformanceFrontPage />} />
          <Route path="vendor/performance/vendor-scorecard" element={<VendorPerformance />} />
          <Route path="vendor/performance/performance-reports" element={<VendorPerformance />} />
          <Route path="vendor/performance/sla-tracking"    element={<VendorPerformance />} />
          <Route path="vendor/reports"                      element={<VendorReportsFrontPage />} />
          <Route path="vendor/reports/vendor-performance"   element={<VendorReports />} />
          <Route path="vendor/reports/contract-expiry"      element={<VendorReports />} />
          <Route path="vendor/reports/invoice-payment"      element={<VendorReports />} />
          <Route path="vendor/settings"                    element={<VendorSettingsFrontPage />} />
          <Route path="vendor/settings/vendor-types"        element={<VendorSettings />} />
          <Route path="vendor/settings/contract-terms"      element={<VendorSettings />} />
          <Route path="vendor/settings/payment-terms"       element={<VendorSettings />} />
          <Route path="vendor/:sectionId"                   element={<SubItemsPage moduleKey="vendor" />} />

          <Route path="vendor/invoices/challans"     element={<DeliveryChallanList />} />
          {/* <Route path="/dashboard/vendor/invoices/challans/:id" element={<DeliveryChallanDetail />} /> */}
          <Route path="vendor/invoices/quotations"   element={<QuotationList />} />          
          {/* <Route path="/dashboard/vendor/invoices/quotations/:id" element={<QuotationDetail />} /> */}
          <Route path="vendor/invoices/credit-notes" element={<CreditNoteList />} />
          {/* <Route path="/dashboard/vendor/invoices/credit-notes/:id" element={<CreditNoteDetail />} /> */}
          <Route path="vendor/invoices/debit-notes"  element={<DebitNoteList />} />
          {/* <Route path="/dashboard/vendor/invoices/debit-notes/:id" element={<DebitNoteDetail />} /> */}
          
          <Route path="vendor/invoices/challans/:id" element={<DeliveryChallanDetail />} />
          <Route path="vendor/invoices/quotations/:id" element={<QuotationDetail />} />
          <Route path="vendor/invoices/credit-notes/:id" element={<CreditNoteDetail />} />
          <Route path="vendor/invoices/debit-notes/:id" element={<DebitNoteDetail />} />
           
          <Route path="client"                         element={<SubItemsPage moduleKey="client" />} />
          <Route path="client/clients"                 element={<ClientFrontPage />}/>
          <Route path="client/clients/list"            element={<ClientList />} />
          <Route path="client/clients/add"             element={<AddClient />} />
          <Route path="client/clients/categories"      element={<ClientCategories />} />
          <Route path="client/clients/contacts"        element={<ClientContacts />} /> 

          <Route path="client/leads" element={<LeadFrontPage />}/>
          <Route path="client/leads/add"  element={<AddNewLead />}/>
          <Route path="client/leads/list" element={<LeadList />}/>
          <Route path="client/leads/sources" element={<LeadSource />}/>
          <Route path="client/leads/conversion" element={<LeadConversion />}/>

          <Route path="client/opportunities" element={<OpportunityFrontPage />}/>
          <Route  path="client/opportunities/add"  element={<AddNewOpportunity />}/>
          <Route  path="client/opportunities/list"  element={<OpportunityList />}/>
          <Route path="client/opportunities/pipeline" element={<SalesPipeline />} />
          <Route path="client/opportunities/quotations" element={<QuotationManagement />} />
          <Route path="client/quotations/add"  element={<AddQuotation />}/>

          <Route path="client/orders" element={<OrderFrontPage />}/>
          <Route path="client/orders/add" element={<CreateOrder />}/>
          <Route path="client/orders/edit/:id" element={<EditOrder />}/>
          <Route  path="client/orders/list"  element={<OrderList />}/>
          <Route  path="client/orders/status"  element={<OrderStatus />}/>
          <Route path="client/orders/delivery-schedule" element={<DeliverySchedule />}/>
          
          <Route path="client/service" element={<ServiceFrontPage />}/>
          <Route  path="client/service/add"  element={<ServiceRequest />}/>
          <Route  path="client/service/history"  element={<ServiceHistory />}/>
          <Route path="client/service/warranty" element={<WarrantyManagement />}/>
          <Route path="client/service/complaints" element={<Complaints />}/>

          <Route path="client/reports" element={<ReportsFrontPage />}/>
          <Route path="client/reports/client-report" element={<ClientReport />}/>
          <Route path="client/reports/sales-report" element={<SalesReport />}/>
          <Route path="client/reports/order-report" element={<OrderReport />} />
          <Route path="client/reports/feedback-report" element={<ClientFeedbackReport />} />

          <Route path="client/:sectionId"              element={<SubItemsPage moduleKey="client" />} />

          <Route path="accounts"                                    element={<SubItemsPage moduleKey="accounts" />} />
          <Route path="accounts/financials"                         element={<FinancialsFrontPage />} />
          <Route path="accounts/financials/dashboard"               element={<FinancialsDashboard />} />
          <Route path="accounts/financials/ledger"                  element={<GeneralLedger />} />
          <Route path="accounts/financials/trial-balance"           element={<TrialBalance />} />
          <Route path="accounts/financials/reports"                 element={<FinancialReports />} />

          {/* Invoices */}
          <Route path="accounts/invoices"                           element={<InvoicesFrontPage />} />
          <Route path="accounts/invoices/list"                      element={<InvoiceListAccounts />} />
          <Route path="accounts/invoices/create"                    element={<CreateInvoice />} />
          <Route path="accounts/invoices/tracking"                  element={<InvoiceTracking />} />
          <Route path="accounts/invoices/receipts"                  element={<PaymentReceipts />} />

          {/* Payments */}
          <Route path="accounts/payments"                           element={<PaymentsFrontPage />} />
          <Route path="accounts/payments/list"                      element={<PaymentList />} />
          <Route path="accounts/payments/make"                      element={<MakePayment />} />
          <Route path="accounts/payments/modes"                     element={<PaymentModes />} />
          <Route path="accounts/payments/reconciliation"            element={<BankReconciliation />} />
          <Route path="accounts/cost-centers"                     element={<CostCenters />} />
          <Route path="accounts/budgets"                          element={<Budgets />} />
          <Route path="accounts/employee-advances"                element={<EmployeeAdvances />} />
          <Route path="accounts/fixed-assets"                     element={<FixedAssets />} />
          <Route path="accounts/journal-entries"                  element={<JournalEntries />} />

          {/* Expenses */}
          <Route path="accounts/expenses"                           element={<ExpensesFrontPage />} />
          <Route path="accounts/expenses/list"                      element={<ExpenseList />} />
          <Route path="accounts/expenses/add"                       element={<AddExpense />} />
          <Route path="accounts/expenses/categories"                element={<ExpenseCategories />} />
          <Route path="accounts/expenses/reports"                   element={<ExpenseReports />} />

          {/* Account Vendors */}
          <Route path="accounts/vendors"                            element={<AccountVendorsFrontPage />} />
          <Route path="accounts/vendors/list"                       element={<AccountVendorList />} />
          <Route path="accounts/vendors/add"                        element={<AddAccountVendor />} />
          <Route path="accounts/vendors/payments"                   element={<VendorPayments />} />
          <Route path="accounts/vendors/invoices"                   element={<VendorInvoices />} />

          <Route path="accounts/reports"                             element={<AccountsReports />} />
          <Route path="accounts/reports/profit-loss"                element={<ProfitLossReport />} />
          <Route path="accounts/reports/balance-sheet"              element={<BalanceSheet />} />
          <Route path="accounts/reports/cash-flow"                  element={<CashFlowReport />} />
          <Route path="accounts/reports/gst"                        element={<GstReport />} />
          <Route path="accounts/:sectionId"                         element={<SubItemsPage moduleKey="accounts" />} />

          <Route path="stock"                                        element={<SubItemsPage moduleKey="stock" />} />
          <Route path="stock/inventory"                            element={<Inventory />} />
          <Route path="stock/inventory/balances"                   element={<StockBalances />} />
          <Route path="stock/inventory/movements"                  element={<StockMovements />} />
          <Route path="stock/inventory/receipt"                    element={<StockReceipt />} />
          <Route path="stock/inventory/quality"                    element={<QualityInspection />} />
          <Route path="stock/inventory/picklist"                   element={<PickList />} />
          <Route path="stock/inventory/issue"                      element={<StockIssue />} />
          <Route path="stock/inventory/transfer"                   element={<StockTransfer />} />
          <Route path="stock/inventory/count"                      element={<StockCount />} />
          <Route path="stock/inventory/returns"                    element={<StockReturns />} />
          <Route path="stock/inventory/low-alerts"                 element={<LowStockAlerts />} />
          <Route path="stock/inventory/testing-flow"               element={<InventoryTestingFlow />} />
          <Route path="stock/inventory/stock-levels"              element={<StockLevelPage />} />
          <Route path="stock/inventory/item-catalog"              element={<ItemCatalogPage />} />
          <Route path="stock/inventory/item-catalog/add"          element={<AddNewItemPage />} /> 
          <Route path="stock/inventory/stock-adjustment"          element={<StockAdjustmentPage />} />
          <Route path="stock/inventory/stock-transfer"            element={<StockTransferPage />} />
          <Route path="stock/inventory/stock-alerts"              element={<StockAlertsPage />} />
          <Route path="stock/items"                               element={<ItemsPage />} />
          <Route path="stock/items/item-list"                     element={<ItemListPage />} />
          <Route path="stock/items/add-new-item"                  element={<AddNewItemPage />} />
          <Route path="stock/items/item-categories"               element={<ItemCategoriesPage />} />
          <Route path="stock/items/bill-of-materials"             element={<BillOfMaterialsPage />} />

          <Route path="stock/warehouse"                           element={<WarehousePage />} />
          <Route path="stock/warehouse/warehouse-list"            element={<WarehouseListPage />} />
          <Route path="stock/warehouse/add-warehouse"             element={<AddWarehousePage />} />
          <Route path="stock/warehouse/location-mapping"          element={<LocationMappingPage />} />
          <Route path="stock/warehouse/inventory-counts"          element={<InventoryCountsPage />} />

          <Route path="stock/production"                          element={<ProductionPage />} />
          <Route path="stock/production/production-planning"      element={<ProductionPlanningPage />} />
          <Route path="stock/production/work-orders"              element={<WorkOrdersPage />} />
          <Route path="stock/production/production-scheduling"    element={<ProductionSchedulingPage />} />
          <Route path="stock/production/bom"                      element={<BillOfMaterialsPage />} />
          <Route path="stock/production/mrp"                      element={<MrpPage />} />

          <Route path="stock/reports"                             element={<StockReportsPage />} />
          <Route path="stock/reports/stock-report"              element={<StockReportPage />} />
          <Route path="stock/reports/inventory-report"          element={<InventoryReportPage />} />
          <Route path="stock/reports/stock-movement-report"     element={<StockMovementReportPage />} />
          <Route path="stock/reports/production-report"         element={<ProductionReportPage />} />
          <Route path="stock/reports/inventory-valuation"       element={<InventoryValuationReportPage />} />
          <Route path="stock/reports/inventory-accuracy"        element={<InventoryAccuracyReportPage />} />
          <Route path="stock/reports/slow-moving"               element={<SlowMovingItemsReportPage />} />

          <Route path="stock/settings"                          element={<StockSettingsPage />} />
          <Route path="stock/settings/uom"                      element={<UOMManagementPage />} />
          <Route path="stock/settings/inventory-settings"       element={<InventorySettingsPage />} />

          <Route path="stock/:sectionId"                          element={<SubItemsPage moduleKey="stock" />} />

          <Route path="inventorymgmt/items/item-list"                     element={<ItemListPage />} />
          <Route path="inventorymgmt/items/add-new-item"                  element={<AddNewItemPage />} />
          <Route path="inventorymgmt/items/item-categories"               element={<ItemCategoriesPage />} />
          <Route path="inventorymgmt/items/bill-of-materials"             element={<BillOfMaterialsPage />} />
          
          <Route path="inventorymgmt/inventory/stock-levels"              element={<StockLevelPage />} />
          <Route path="inventorymgmt/inventory/stock-adjustment"          element={<StockAdjustmentPage />} />
          <Route path="inventorymgmt/inventory/stock-transfer"            element={<StockTransferPage />} />
          <Route path="inventorymgmt/inventory/stock-alerts"              element={<StockAlertsPage />} />

          <Route path="inventorymgmt/warehouse/warehouse-list"            element={<WarehouseListPage />} />
          <Route path="inventorymgmt/warehouse/add-warehouse"             element={<AddWarehousePage />} />
          <Route path="inventorymgmt/warehouse/location-mapping"          element={<LocationMappingPage />} />
          <Route path="inventorymgmt/warehouse/inventory-counts"          element={<InventoryCountsPage />} />

          <Route path="inventorymgmt/production/production-planning"      element={<ProductionPlanningPage />} />
          <Route path="inventorymgmt/production/work-orders"              element={<WorkOrdersPage />} />
          <Route path="inventorymgmt/production/production-scheduling"    element={<ProductionSchedulingPage />} />
          <Route path="inventorymgmt/production/mrp"                      element={<MrpPage />} />

          <Route path="inventorymgmt/reports/inventory-valuation"       element={<InventoryValuationReportPage />} />
          <Route path="inventorymgmt/reports/stock-movement-report"     element={<StockMovementReportPage />} />
          <Route path="inventorymgmt/reports/inventory-accuracy"        element={<InventoryAccuracyReportPage />} />
          <Route path="inventorymgmt/reports/slow-moving"               element={<SlowMovingItemsReportPage />} />

          <Route path="inventorymgmt"            element={<SubItemsPage moduleKey="inventorymgmt" />} />
          <Route path="inventorymgmt/:sectionId" element={<SubItemsPage moduleKey="inventorymgmt" />} />

          <Route path="webhooks" element={<ManageWebhooks />} />
          <Route path="webhooks/manage-webhooks" element={<ManageWebhooks />} />
          <Route path="webhooks/logs" element={<WebhookLogs />} />
        </Route>
      </Routes>
    </Router>
    </NotificationProvider>
  );
}

export default App;
