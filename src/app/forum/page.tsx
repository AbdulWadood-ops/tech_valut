import type { Metadata } from 'next';
import ForumPageContent from '../../components/ForumPageContent';

export const metadata: Metadata = {
  title: 'Tech Community Forum & Debates | TechVault',
  description: 'Join tech enthusiasts to discuss real-world device performance, camera comparisons, battery tests, rumors, and troubleshooting.',
};

export default function ForumPage() {
  return <ForumPageContent />;
}
