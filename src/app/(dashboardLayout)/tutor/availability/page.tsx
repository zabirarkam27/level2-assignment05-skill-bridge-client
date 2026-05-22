"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, Plus, Trash2, Save } from "lucide-react";
import { motion } from "framer-motion";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";

type AvailabilityFormSlot = {
  day: string;
  startTime: string;
  endTime: string;
};

type AvailabilityApiSlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function SlotRow({
  slot,
  onRemove,
  onChange,
}: {
  slot: AvailabilityFormSlot;
  onRemove: () => void;
  onChange: (updates: Partial<typeof slot>) => void;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <select
        aria-label="Day of week"
        title="Day of week"
        value={slot.day}
        onChange={(e) => onChange({ day: e.target.value })}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#611f69]/40 dark:focus:ring-[#c084fc]/40 w-36"
      >
        {DAYS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
      <input
        type="time"
        value={slot.startTime}
        title="Start time"
        aria-label="Start time"
        onChange={(e) => onChange({ startTime: e.target.value })}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#611f69]/40 dark:focus:ring-[#c084fc]/40 w-32"
      />
      <span className="text-gray-400 text-sm">to</span>
      <input
        type="time"
        value={slot.endTime}
        title="End time"
        aria-label="End time"
        onChange={(e) => onChange({ endTime: e.target.value })}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#611f69]/40 dark:focus:ring-[#c084fc]/40 w-32"
      />
      <button
        onClick={onRemove}
        aria-label="Remove slot"
        title="Remove slot"
        className="p-2 rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

const DAY_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const INV_DAY_MAP: Record<number, string> = Object.fromEntries(
  Object.entries(DAY_MAP).map(([k, v]) => [v, k]),
);

export default function TutorAvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilityFormSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slotToRemove, setSlotToRemove] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchSlots = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/availability`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );
        if (!isMounted) return;
        const data = await res.json();
        const raw = Array.isArray(data.data) ? data.data : [];
        if (isMounted) {
          setSlots(
            raw.map(
              ({ dayOfWeek, startTime, endTime }: AvailabilityApiSlot) => ({
                day: INV_DAY_MAP[dayOfWeek] || "Monday",
                startTime,
                endTime,
              }),
            ),
          );
        }
      } catch {
        if (isMounted) {
          setSlots([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchSlots();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const addSlot = () => {
    setSlots((s) => [
      ...s,
      { day: "Monday", startTime: "09:00", endTime: "11:00" },
    ]);
  };

  const removeSlot = (i: number) => {
    setSlots((s) => s.filter((_, idx) => idx !== i));
    setSlotToRemove(null);
  };

  const updateSlot = (i: number, updates: Partial<(typeof slots)[0]>) => {
    setSlots((s) =>
      s.map((slot, idx) => (idx === i ? { ...slot, ...updates } : slot)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formattedSlots = slots.map((s) => ({
        dayOfWeek: DAY_MAP[s.day],
        startTime: s.startTime,
        endTime: s.endTime,
      }));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/availability`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slots: formattedSlots }),
        },
      );
      if (!res.ok) throw new Error("Failed");
      toast.success("Availability saved!");
    } catch {
      toast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-[#611f69] dark:text-[#c084fc]" />
          My Availability
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Set the days and times when students can book you
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-5">
              {slots.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    No slots added yet. Click below to add your availability.
                  </p>
                </div>
              ) : (
                slots.map((slot, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SlotRow
                      slot={slot}
                      onRemove={() => setSlotToRemove(i)}
                      onChange={(u) => updateSlot(i, u)}
                    />
                  </motion.div>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={addSlot}
                className="border-[#611f69] text-[#611f69] hover:bg-[#611f69]/10 dark:border-[#c084fc] dark:text-[#c084fc]"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Slot
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
      <ConfirmActionDialog
        open={slotToRemove !== null}
        onOpenChange={(open) => !open && setSlotToRemove(null)}
        title="Remove availability slot?"
        description="Students will no longer be able to book this time slot after you save your availability."
        confirmText="Remove Slot"
        danger
        onConfirm={() => {
          if (slotToRemove !== null) removeSlot(slotToRemove);
        }}
      />
    </div>
  );
}
