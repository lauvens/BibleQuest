export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-900 dark:to-primary-800 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
