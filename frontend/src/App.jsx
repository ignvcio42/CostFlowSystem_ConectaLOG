import { useEffect } from "react";
import { Navigate, Outlet, Routes, Route } from "react-router-dom";
import SignIn from "./pages/auth/sign-in";
import SignUp from "./pages/auth/sign-up";
import Dashboard from "./pages/dashboard";
import Settings from "./pages/settings";
import History from "./pages/history";
import AccountPage from "./pages/account-page";
import useStore from "./store";
import { setAuthToken } from "./libs/api_calls";
import { Toaster } from "sonner";
import Navbar from "./components/navbar";
import Transactions from "./pages/transactions";
// import Footer from "./components/footer";
import AdminUsersPage from "./pages/admin/users";
import ProtectedRoute from "./components/ProtectedRoute";

const RootLayout = () => {
  const { user } = useStore((state) => state);

  setAuthToken(user?.token || "");
  console.log("user", user);

  return !user ? (
    <Navigate to="sign-in" replace={true} />
  ) : (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow w-full">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6">
          <Outlet />
        </div>
      </main>
      <div>{/* <Footer /> */}</div>
    </div>
  );
};

function App() {
  const { theme } = useStore((state) => state);

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [theme]);
  
  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-slate-900">
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Navigate to="/overview" />} />
          <Route path="/overview" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/transactions" element={<Transactions />} />

          {/* Ruta protegida solo para rol ADMIN */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
      </Routes>

      <Toaster richColors position="top-center" />
    </div>
  );
}

export default App;