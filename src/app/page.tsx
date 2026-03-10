import { redirect } from 'next/navigation'

export default function Home() {
  // It's a private portal, so redirect the root to the login page immediately.
  redirect('/login')
}
