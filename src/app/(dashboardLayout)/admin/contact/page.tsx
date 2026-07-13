"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DataListControls,
  SortDirection,
} from "@/components/data-list/DataListControls";
import { compareValues, paginateItems } from "@/lib/data-list";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const contactSortOptions = [
  { label: "Newest", value: "createdAt" },
  { label: "Name", value: "name" },
  { label: "Email", value: "email" },
  { label: "Subject", value: "subject" },
  { label: "Read status", value: "isRead" },
];

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadMessages = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load contact messages");
      }

      setMessages(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load messages",
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, sortBy, sortDirection, pageSize]);

  const filteredMessages = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return messages;

    return messages.filter((message) =>
      [message.name, message.email, message.subject, message.message]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [messages, query]);

  const unreadCount = messages.filter((message) => !message.isRead).length;
  const sortedMessages = useMemo(
    () =>
      [...filteredMessages].sort((first, second) => {
        const getValue = (message: ContactMessage) => {
          if (sortBy === "name") return message.name;
          if (sortBy === "email") return message.email;
          if (sortBy === "subject") return message.subject;
          if (sortBy === "isRead") return message.isRead;
          return new Date(message.createdAt);
        };

        return compareValues(getValue(first), getValue(second), sortDirection);
      }),
    [filteredMessages, sortBy, sortDirection],
  );
  const paginatedMessages = useMemo(
    () => paginateItems(sortedMessages, page, pageSize),
    [sortedMessages, page, pageSize],
  );

  const markAsRead = async (id: string) => {
    const toastId = toast.loading("Updating message...");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact/${id}/read`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update message");
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === id ? { ...message, isRead: true } : message,
        ),
      );
      toast.success("Message marked as read", { id: toastId });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update message",
        { id: toastId },
      );
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#611f69] dark:text-[#c084fc]" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Contact Messages
            </h1>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Review support, partnership, and general messages submitted from the
            website contact form.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-[#611f69]/10 px-4 py-3 text-[#611f69] dark:bg-[#c084fc]/15 dark:text-[#c084fc]">
            <p className="text-xs font-medium">Total</p>
            <p className="text-2xl font-bold">{messages.length}</p>
          </div>
          <div className="rounded-lg bg-amber-100 px-4 py-3 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            <p className="text-xs font-medium">Unread</p>
            <p className="text-2xl font-bold">{unreadCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, subject, or message..."
            className="pl-9"
          />
        </div>
          {!loading && (
            <DataListControls
              totalItems={sortedMessages.length}
              page={page}
              pageSize={pageSize}
              sortBy={sortBy}
              sortDirection={sortDirection}
              sortOptions={contactSortOptions}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onSortByChange={setSortBy}
              onSortDirectionChange={setSortDirection}
            />
          )}
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading contact messages...
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No contact messages found.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {paginatedMessages.map((message) => (
              <article
                key={message.id}
                className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {message.subject}
                    </h2>
                    <span
                      className={
                        message.isRead
                          ? "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                      }
                    >
                      {message.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{message.name}</span>
                    <a
                      href={`mailto:${message.email}`}
                      className="inline-flex items-center gap-1 text-[#611f69] hover:underline dark:text-[#c084fc]"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {message.email}
                    </a>
                    <span>
                      {new Date(message.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
                    {message.message}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={`mailto:${message.email}`}>Reply</a>
                  </Button>
                  {!message.isRead && (
                    <Button size="sm" onClick={() => markAsRead(message.id)}>
                      Mark read
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
