"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialPayload: ContactPayload = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function validate(payload: ContactPayload) {
  if (payload.name.trim().length < 2) return "Name must be at least 2 characters";
  if (!/^\S+@\S+\.\S+$/.test(payload.email)) return "Please enter a valid email";
  if (payload.subject.trim().length < 4) {
    return "Subject must be at least 4 characters";
  }
  if (payload.message.trim().length < 10) {
    return "Message must be at least 10 characters";
  }
  return null;
}

export function ContactForm() {
  const [payload, setPayload] = useState<ContactPayload>(initialPayload);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof ContactPayload, value: string) => {
    setPayload((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validate(payload);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Sending your message...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to send message");
      }

      setPayload(initialPayload);
      toast.success("Message sent. We will get back to you soon.", {
        id: toastId,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message",
        { id: toastId },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="contact-name"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Name
          </label>
          <Input
            id="contact-name"
            value={payload.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Your full name"
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="contact-email"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <Input
            id="contact-email"
            type="email"
            value={payload.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <label
          htmlFor="contact-subject"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Subject
        </label>
        <Input
          id="contact-subject"
          value={payload.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          placeholder="How can we help?"
          required
        />
      </div>

      <div className="mt-4 space-y-2">
        <label
          htmlFor="contact-message"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Message
        </label>
        <Textarea
          id="contact-message"
          value={payload.message}
          onChange={(event) => updateField("message", event.target.value)}
          rows={6}
          placeholder="Tell us a little more about your question..."
          className="resize-none"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
