import React, { useEffect, useState } from "react";
import * as z from "zod";
import useStore from "@/store";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/libs/api_calls";
import { toast } from "sonner";


const LoginSchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "invalid email" }),
  password: z
    .string({ required_error: "password is required" })
    .min(1, "password is required"),
});

const SignIn= () => {
  const { user, setCredentails } = useStore((state) => state);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    user && navigate("/");
  }, [user]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const { data: res } = await api.post("/auth/sign-in", data);

      if (res?.user) {
        toast.success(res?.message);

        const userInfo = {...res?.user, token: res.token };
        localStorage.setItem("user", JSON.stringify(userInfo));

        setCredentails(userInfo);

        setTimeout(() => {
          navigate("/overview");
        }, 1500);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen py-10">
      <Card className="w-[400px] bg-white dark:bg-black/20 shadow-md overflow-hidden">
        <div className="py-0">
          <CardHeader>
            <CardTitle className="mb-8 text-center dark:text-white">
              Sign in
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 px-6 pb-6"
            >

              <div className="space-y-2 dark:text-white">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  disabled={loading}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2 dark:text-white">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={loading}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </CardContent>

          <CardFooter className="justify-center gap-2">
            <p className="text-sm text-gray-600">Don't have an account?</p>
            <Link
              to="/sign-up"
              className="text-sm text-blue-500 hover:underline"
            >
              Sign up
            </Link>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default SignIn;
