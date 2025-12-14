import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { registerConstant } from "@/constants";
import axios from "axios";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  // ! AUTH
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ⛔ stop browser refresh

    if (userInfo.password !== userInfo.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("lomi");
    await axios.post(
      "http://localhost:3000/api/auth/signup",
      {
        name: userInfo.name,
        email: userInfo.email,
        password: userInfo.password,
      },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    window.location.reload();
    console.log(userInfo);
  };
  return (
    <div className="flex items-center justify-center h-screen max-w-130 mx-auto ">
      <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0">
            <form
              className="p-6 md:p-8"
              onSubmit={(e) => {
                e.preventDefault();
                // handleRegister();
              }}
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">
                    {registerConstant.heading1}
                  </h1>
                </div>
                <Field>
                  <Input
                    id="name"
                    type="name"
                    value={userInfo.name}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        name: e.target.value,
                      })
                    }
                    placeholder={registerConstant.name}
                    required
                  />
                </Field>
                <Field>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        email: e.target.value,
                      })
                    }
                    placeholder={registerConstant.email}
                    required
                  />
                </Field>
                <Field>
                  <Input
                    value={userInfo.password}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        password: e.target.value,
                      })
                    }
                    placeholder={registerConstant.passwd}
                    id="password"
                    type="password"
                    required
                  />
                </Field>
                <Field>
                  <Input
                    value={userInfo.confirmPassword}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder={registerConstant.confirmPasswd}
                    id="confirmPassword"
                    type="password"
                    required
                  />
                </Field>
                <Field>
                  <Button onClick={(e) => handleRegister(e)} type="submit">
                    {registerConstant.signUp}
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  {registerConstant.or}
                </FieldSeparator>
                <Field className="grid grid-cols-1">
                  <Button
                    variant="outline"
                    type="submit"
                    onClick={(event: React.FormEvent<HTMLFormElement>) =>
                      handleRegister(event)
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">Sign up with Google</span>
                  </Button>
                </Field>
                <FieldDescription className="text-center">
                  {registerConstant.signInIntro}{" "}
                  <a href="/login">{registerConstant.signIn}</a>
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
