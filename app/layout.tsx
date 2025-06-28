
export const metadata = {
  title: 'PorVerse',
  description: 'Platforma ta de evoluție AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
