import React, { useState } from "react";
import useStore from "../store";
import { Button } from "./ui/button";
import { LucideSunMoon } from "lucide-react";
import { IoMdMoon } from "react-icons/io";

const ThemeSwitch = () => {
  const { theme, setTheme } = useStore((state) => state);
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Button onClick={toggleTheme} className="outline-none" >
      {isDarkMode ? (<LucideSunMoon size={20} className="text-gray-500"/> ):( < IoMdMoon size={20} className="text-gray-500"/>)}
    </Button>
  );
};

export default ThemeSwitch;
