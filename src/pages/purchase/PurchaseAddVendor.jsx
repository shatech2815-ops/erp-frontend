// Reuses AddVendor with Purchase Management breadcrumb/nav context
import AddVendor from '../vendor/AddVendor';

const PURCHASE_CONTEXT = {
  moduleBase:  '/dashboard/purchase',
  sectionBase: '/dashboard/purchase/vendors',
  listPath:    '/dashboard/purchase/vendors/list',
  moduleLabel: 'Purchase Management',
};

const PurchaseAddVendor = () => <AddVendor context={PURCHASE_CONTEXT} />;

export default PurchaseAddVendor;
