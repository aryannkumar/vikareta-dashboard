import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard as per Next.js config
  redirect('/dashboard');
}
