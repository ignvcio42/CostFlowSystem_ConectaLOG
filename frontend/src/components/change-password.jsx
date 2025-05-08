import api from "@/libs/api_calls";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { RiInputField } from "react-icons/ri";
import { toast } from "sonner";
import Input_2 from "./Input_2";
import { Button } from "@headlessui/react";
import { BiLoader } from "react-icons/bi";

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const [loading, setLoading] = useState(false);

  const submitPasswordHandler = async (data) => {
    try {
      setLoading(true);

      const { data: res } = await api.put("/user/change-password", data);

      if (res?.status === "success") {
        toast.success(" Password changed successfully!");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20">
      <form onSubmit={handleSubmit(submitPasswordHandler)}>
        <div>
          <p className="text-xl font-bold text-black dark:text-white mb-1">
            Change Password
          </p>
          <span className="block text-gray-700 dark:text-gray-400 text-sm md:text-base mb-2">
            Enter your new password
          </span>
          <div className="mt-6 space-y-6">
            <Input_2
              className="w-full text-sm border dark:border-gray-800 dark:bg-transparent dark:placeholder:text-gray-700 dark:text-gray-400 dark:outline-none"
              disabled={loading}
              type="password"
              name="currentPassword"
              label="Current Password"
              {...register("currentPassword", {
                required: "Current password is required",
              })}
              error={
                errors.currentPassword ? errors.currentPassword.message : ""
              }
            />
            <Input_2
              className="w-full text-sm border dark:border-gray-800 dark:bg-transparent dark:placeholder:text-gray-700 dark:text-gray-400 dark:outline-none"
              disabled={loading}
              type="password"
              name="newPassword"
              label="New Password"
              {...register("newPassword", {
                required: "New password is required",
              })}
              error={errors.newPassword ? errors.newPassword.message : ""}
            />
            <Input_2
              className="w-full text-sm border dark:border-gray-800 dark:bg-transparent dark:placeholder:text-gray-700 dark:text-gray-400 dark:outline-none"
              disabled={loading}
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              {...register("confirmPassword", {
                required: "Confirm password is required",
                validate: (value) => {
                  const { newPassword } = getValues();

                  return newPassword === value || "Passwords do not match";
                },
              })}
              error={
                errors.confirmPassword ? errors.confirmPassword.message : ""
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-6 mt-10 justify-end pb-10  border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            type="reset"
            className="px-6 bg-transparent text-black dark:text-white border border-gray-200 dark:border-gray-700"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-6 bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600"
          >
            {loading ? (
              <BiLoader className="animate-spin text-white" />
            ) : (
              "Change Password"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
