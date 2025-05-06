import useStore from "@/store";
import React from "react";
import { useState } from "react";

export const SettingForm = () => {
  const { user, theme, setTheme } = useStore((state) => state);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { ...user },
  });
  const [selectedCountry, setSelectedCountry] = useState({
    country: user?.country,
  });
  const [query, setQuery] = useState("");
  const [countriesData, setCountriesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (values) => {};

  const toggleTheme = (values) => {
    setTheme(val);
    localStorage.setItem("theme", val);
  }

  return <div>SettingForm</div>;
};
