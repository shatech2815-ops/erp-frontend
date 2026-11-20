// Reuses VendorList with Purchase Management breadcrumb/nav context
import VendorList from '../vendor/VendorList';

const PURCHASE_CONTEXT = {
  moduleBase:  '/dashboard/purchase',
  sectionBase: '/dashboard/purchase/vendors',
  addPath:     '/dashboard/purchase/vendors/add',
  moduleLabel: 'Purchase Management',
};

const PurchaseVendorList = () => <VendorList context={PURCHASE_CONTEXT} />;

export default PurchaseVendorList;
