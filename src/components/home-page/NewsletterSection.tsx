"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, BookOpen, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success("Thanks! We'll share new courses and mentor updates soon.");
    setEmail("");
  };

  return (
    <section className="bg-white px-4 py-20 transition-colors dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-lg border border-gray-200 bg-[#611f69] text-white shadow-sm dark:border-gray-800 dark:bg-gray-950 lg:grid-cols-[1fr_0.8fr]">
        <div className="p-8 sm:p-10 lg:p-12">
          <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-sm">
            <Bell className="h-4 w-4" />
            Learning updates
          </div>
          <h2 className="mt-5 max-w-2xl text-3xl font-bold">
            Get notified about new courses and available mentors
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
            Join the MentorForge update list for fresh course categories,
            popular mentors, and booking availability highlights.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="h-11 border-white/20 bg-white pl-10 text-gray-900 placeholder:text-gray-500"
              />
            </div>
            <Button
              type="submit"
              className="h-11 bg-white px-6 text-[#611f69] hover:bg-gray-100"
            >
              Subscribe
            </Button>
          </form>
        </div>

        <div className="border-t border-white/15 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
          <div className="flex h-full flex-col justify-center gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/10">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Weekly course picks</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  A short digest of useful courses and mentors for students who
                  want to keep learning consistently.
                </p>
              </div>
            </div>
            <div className="rounded-md border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white/80">
              No spam, no payment alerts. Just relevant learning updates from
              the MentorForge platform.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
