import type { Metadata } from 'next';
import AddDevicePageContent from '../../components/AddDevicePageContent';

export const metadata: Metadata = {
  title: 'Add New Device | TechVault',
  description: 'Contribute to the TechVault database by adding your own custom device or benchmark scores.',
};

export default function AddDevicePage() {
  return <AddDevicePageContent />;
}
