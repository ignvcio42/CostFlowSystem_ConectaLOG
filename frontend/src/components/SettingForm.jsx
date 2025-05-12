import useStore from "@/store";
import React from "react";
import { useState } from "react";
import { set, useForm } from "react-hook-form";
import Input_2 from "./Input_2";
import { Button } from "./ui/button";
import { toast } from "sonner";
import api, { setAuthToken } from "@/libs/api_calls";
import { BiLoader } from "react-icons/bi";

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

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      const newData = {
        ...values,
      };
      const { data: res } = await api.put("/user", newData);

      if (res?.user) {
        const newUser = { ...res.user, token: user.token };
        localStorage.setItem("user", JSON.stringify(newUser));

        toast.success(res?.message);
      }
    } catch (error) {
      console.error("something went wrong", error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = (val) => {
    setTheme(val);
    localStorage.setItem("theme", val);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full">
          <Input_2
            disabled={isLoading}
            id="firstname"
            label="First Name"
            type="text"
            placeholder="Doe"
            error={errors.firstname?.message}
            {...register("firstname")}
            className="bg-transparent appearance-none border border-gray-300 dark:border-gray-800 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-500 outline-none focus:ring-1 ring-blue-500 dark:placeholder:text-gray-700"
          />
        </div>
        <div className="w-full">
          <Input_2
            disabled={isLoading}
            id="lastname"
            label="Last Name"
            type="text"
            placeholder="John"
            error={errors.lastname?.message}
            {...register("lastname")}
            className="bg-transparent appearance-none border border-gray-300 dark:border-gray-800 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-500 outline-none focus:ring-1 ring-blue-500 dark:placeholder:text-gray-700"
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full">
          <Input_2
            disabled={true}
            id="email"
            label="Email"
            type="text"
            placeholder="Doe@gmail.com"
            error={errors.firstname?.message}
            {...register("email")}
            className="bg-transparent appearance-none border border-gray-300 dark:border-gray-800 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-500 outline-none focus:ring-1 ring-blue-500 dark:placeholder:text-gray-700"
          />
        </div>
        <div className="w-full">
          <Input_2
            disabled={isLoading}
            id="contact"
            label="Phone"
            type="text"
            placeholder="+56912345678"
            error={errors.lastname?.message}
            {...register("contact")}
            className="bg-transparent appearance-none border border-gray-300 dark:border-gray-800 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-500 outline-none focus:ring-1 ring-blue-500 dark:placeholder:text-gray-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 justify-end pb-10 border-b-2 border-gray-200 dark:border-gray-800">
        {/* <Button
          variant="outline"
          type="reset"
          className="px-6 bg-transparent text-black dark:text-white border border-gray-200 dark:border-gray-700"
        >
          Reset
        </Button> */}
        <Button
          type="submit"
          disabled={isLoading}
          className="px-6 bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 rounded"
        >
          {isLoading ? (
            <BiLoader className="animate-spin text-white" />
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
};
