  
// Reuses VendorList with Accounts Management breadcrumb/nav context
import VendorList from '../vendor/VendorList';

const ACCOUNTS_CONTEXT = {
  moduleBase:  '/dashboard/accounts',
  sectionBase: '/dashboard/accounts/vendors',
  addPath:     '/dashboard/accounts/vendors/add',
  moduleLabel: 'Accounts Management',
};

const AccountVendorList = () => <VendorList context={ACCOUNTS_CONTEXT} />;

export default AccountVendorList;