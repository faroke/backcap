export const metadata = {
  title: "Next.js Blog Example — Backcap",
  description: "Blog API built with Backcap and Next.js App Router",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
