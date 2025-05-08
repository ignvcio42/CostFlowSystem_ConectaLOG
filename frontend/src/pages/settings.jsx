import React from "react";
import useStore from "../store";
import { SettingForm } from "@/components/SettingForm";

const Settings = () => {
  const { user } = useStore((state) => state);
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-4xl px-4 py-4 my-6 shadow-lg bg-gray-50 dark:bg-black/20 md:px-10 md:my-10">
        <div className="mt-6 p-4 border-b-2 border-gray-200 dark:border-gray-800">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
            Settings
          </h2>
        </div>

        <div className="py-10">
          <p className="text-lg font-bold text-black dark:text-white">
            Profile information
          </p>
          <div className="flex items-center gap-4 my-8">
            <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-2xl font-bold text-white dark:text-white cursor-pointer">
              <p>{user?.firstname.charAt(0)}</p>
            </div>
            <p className="text-2xl font-semibold text-black dark:text-gray-400">
              {user?.firstname} {user?.lastname}
            </p>
          </div>
          <SettingForm/>

          {/* {{!user?.provided && <ChangePassword/>}} */}
        </div>
      </div>
    </div>
  );
};

export default Settings;
