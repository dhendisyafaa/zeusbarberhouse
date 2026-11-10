import type { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';

export function PublicPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="w-full flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}
