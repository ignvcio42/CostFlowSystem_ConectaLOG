import { useEffect, useState } from "react";
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

const RootLayout = () => {
  const { user } = useStore((state) => state);

  setAuthToken(user?.token || "");

  console.log(user);

  return !user ? (
    <Navigate to="sign-in" replace={true} />
  ) : (
    <>
      <Navbar />
      <div className="min-h-[cal(h-screen-100px)]">
        <Outlet />
      </div>
      <div>
        {/* <Footer /> */}
      </div>
    </>
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
    <main>
      <div className="w-full min-h-screen px-6 bg-gray-100 md:px-20 dark:bg-slate-900">
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Navigate to="/overview" />} />
            <Route path="/overview" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/history" element={<History />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/transactions" element={<Transactions />} />
          </Route>

          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
        </Routes>
      </div>

      <Toaster richColors position="top-center" />
    </main>
  );
}

export default App;
