import React, { useEffect, useState } from "react";
import * as z from "zod";
import useStore from "@/store";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/libs/api_calls";

const RegisterSchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "invalid email" }),
  firstName: z
    .string({ required_error: "name is required" })
    .min(3, "name is required"),
  password: z
    .string({ required_error: "password is required" })
    .min(8, "password must be at least 8 characters long"),
});

const SignUp = () => {
  const { user } = useStore((state) => state);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    user && navigate("/");
  }, [user]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { data: res } = await api.post("/auth/sign-up", data);

      if (res?.user) {
        toast.success("Cuenta creada! Por favor revisa tu correo para verificar tu cuenta.");
        setTimeout(() => {
          navigate("/verify-email");
        }, 1800);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen py-10 bg-gray-50  bg-[url('/img/logistica-scaled.jpeg')] bg-cover bg-center backdrop-blur-xl">
      <Card className="w-[400px] bg-white  shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="flex flex-col items-center gap-4 pt-6">
          <img
            src="/img/conecta_log.webp"
            alt="ConectaLOG Logo"
            className="h-20 w-auto object-contain hover:scale-105 transition-transform duration-300"
          />
          <CardTitle className="text-xl font-bold text-center ">
            Crear cuenta
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2 ">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                placeholder="John Smith"
                disabled={loading}
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2 ">
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

            <div className="space-y-2 ">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={loading}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition  "
            >
              {loading ? "Creando..." : "Crear cuenta"}
            </button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pb-6">
          <p className="text-sm text-gray-600 ">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/sign-in" className="text-blue-500 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;
