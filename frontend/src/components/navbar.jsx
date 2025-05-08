import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import React, { useState } from "react";
import { MdOutlineClose, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { RiCurrencyFill } from "react-icons/ri";
import { FaTruckPlane } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { IoIosMenu } from "react-icons/io";
import useStore from "../store";
import ThemeSwitch from "./switch";
import TransitionWrapper from "./wrappers/transition-wrapper";

const links = [
  { label: "Dashboard", link: "/overview" },
  { label: "Transactions", link: "/transactions" },
  { label: "Accounts", link: "/accounts" },
  { label: "Settings", link: "/settings" },
];

const UserMenu = () => {
  const { user, setCredentails } = useStore((state) => state);
  const navigate = useNavigate();

  const handleSingout = () => {
    localStorage.removeItem("user");
    setCredentails(null);
    navigate("/sign-in");
  };

  return (
    <Menu as="div" className="relative z-50">
      <div>
        <MenuButton className="">
          <div className="flex items-center gap-2">
            <div className="w-8 sm:w-10 2xl:w-12 h-8 sm:h-10 2xl:h-12 rounded-full text-white bg-violet-600 cursor-pointer flex items-center justify-center">
              <p className="text-xl sm:text-2xl font-bold">{user?.firstname?.charAt(0)}</p>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-lg font-medium text-black dark:text-gray-400">
                {user?.firstname}
              </p>
              <span className="text-sm text-gray-700 dark:text-gray-500">
                {user?.email}
              </span>
            </div>
            <MdOutlineKeyboardArrowDown className="hidden md:block text-2xl text-gray-600 dark:text-gray-300 cursor-pointer" />
          </div>
        </MenuButton>
      </div>
      <TransitionWrapper>
        <MenuItems className="absolute z-50 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="px-1 py-1">
            <MenuItem>
              {({ active }) => (
                <Link to="/settings" className="block w-full">
                  <button
                    className={`${
                      active
                        ? "bg-violet-500/10 text-gray-900 dark:text-white"
                        : "text-gray-900 dark:text-gray-500"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    Profile
                  </button>
                </Link>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={handleSingout}
                  className={`${
                    active
                      ? "bg-violet-500/10 text-gray-900 dark:text-white"
                      : "text-gray-900 dark:text-gray-500"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  Sign Out
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </TransitionWrapper>
    </Menu>
  );
};

const MobileSidebar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useStore((state) => state);

  return (
    <div>
      <Popover className="">
        {({ open }) => (
          <>
            <PopoverButton
              className={`
               flex md:hidden items-center rounded-md font-medium focus:outline-none text-gray-600 dark:text-gray-400`}
            >
              {open ? <MdOutlineClose size={26} /> : <IoIosMenu size={26} />}
            </PopoverButton>
            <TransitionWrapper>
              <PopoverPanel className="absolute right-0 z-50 bg-white dark:bg-slate-800 mt-3 w-screen max-w-sm transform px-4 py-6 shadow-lg rounded-lg">
                <div className="flex flex-col space-y-2">
                  {links.map(({ label, link }, index) => (
                    <Link to={link} key={index} className="w-full">
                      <PopoverButton
                        className={`${
                          link === path
                            ? "bg-black dark:bg-slate-900 text-white"
                            : "text-gray-700 dark:text-gray-500"
                        } w-full px-6 py-2 rounded-full text-left`}
                      >
                        {label}
                      </PopoverButton>
                    </Link>
                  ))}
                  {user?.role === "admin" && (
                    <Link to="/admin/users" className="w-full">
                      <PopoverButton
                        className={`${
                          path === "/admin/users"
                            ? "bg-black dark:bg-slate-900 text-white"
                            : "text-gray-700 dark:text-gray-500"
                        } w-full px-6 py-2 rounded-full text-left`}
                      >
                        Administrar usuarios
                      </PopoverButton>
                    </Link>
                  )}

                  <div className="flex items-center justify-between py-6 px-4">
                    <PopoverButton>
                      <ThemeSwitch />
                    </PopoverButton>
                    <UserMenu />
                  </div>
                </div>
              </PopoverPanel>
            </TransitionWrapper>
          </>
        )}
      </Popover>
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useStore((state) => state);

  return (
    <nav className="sticky top-0 z-30 w-full bg-gray-100/95 dark:bg-slate-900/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 sm:py-4 md:py-6">
        <div className="w-full flex items-center justify-between">
          <Link to="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 flex items-center justify-center bg-violet-700 rounded-xl hover:bg-red-600 dark:bg-red-500 dark:hover:bg-yellow-300 transition-colors">
                <FaTruckPlane className="text-white text-xl sm:text-2xl md:text-3xl hover:animate-spin" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-black dark:text-white">
                Cost-Flow
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 lg:gap-4 overflow-x-auto">
            {links.map(({ label, link }, index) => (
              <div
                key={index}
                className={`${
                  link === path
                    ? "bg-black dark:bg-slate-800 text-white"
                    : "text-gray-700 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700"
                } px-3 lg:px-6 py-2 rounded-full whitespace-nowrap transition-colors`}
              >
                <Link to={link}>{label}</Link>
              </div>
            ))}

            {user?.role === "admin" && (
              <div
                className={`${
                  path === "/admin/users"
                    ? "bg-black dark:bg-slate-800 text-white"
                    : "text-gray-700 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700"
                } px-3 lg:px-6 py-2 rounded-full whitespace-nowrap transition-colors`}
              >
                <Link to="/admin/users">Administrar usuarios</Link>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-6 lg:gap-10 2xl:gap-20">
            <ThemeSwitch />
            <UserMenu />
          </div>

          <div className="flex md:hidden">
            <MobileSidebar />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;