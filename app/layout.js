export const metadata = {
  title: "Dashboard",
  description: "An app by Akshobya Rao🧑‍💻",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
