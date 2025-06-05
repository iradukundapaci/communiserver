"use client";

import { GalleryVerticalEnd } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { LoginForm } from "@/components/login-form"
import { useUser } from "@/lib/contexts/user-context"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter();
  const { hasValidToken } = useUser();

  // Check for valid token on mount and redirect if found
  useEffect(() => {
    if (hasValidToken()) {
      console.log("✅ Valid token found, redirecting to dashboard");
      router.push("/dashboard");
    } else {
      console.log("❌ No valid token found, staying on login page");
    }
  }, [hasValidToken, router]);
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            CommuniServer
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
      <Image
          src="/umuganda1.jpg"
          alt="Image"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
