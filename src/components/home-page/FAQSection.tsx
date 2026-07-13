"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I book a tutor on MentorForge?",
    answer:
      "Browse mentors, open a tutor profile, choose an available slot, pay securely, and then the booking request is created for tutor confirmation.",
  },
  {
    question: "Do students pay before tutor confirmation?",
    answer:
      "Yes. MentorForge uses a payment-first flow. Tutors and admins can verify that payment is completed before confirming a pending session.",
  },
  {
    question: "Can students cancel confirmed sessions?",
    answer:
      "Students can cancel pending bookings, but confirmed sessions are protected. Admins handle confirmed-session cancellation to prevent accidental schedule changes.",
  },
  {
    question: "When can a session be marked completed?",
    answer:
      "Tutors or admins can complete a session only after the scheduled date and time have passed. Students can then leave a review.",
  },
  {
    question: "Where can I find invoices and certificates?",
    answer:
      "Students can view payment history, open invoice previews, print or download invoices, and download certificates after eligible sessions are completed.",
  },
  {
    question: "Does MentorForge support notifications and wishlists?",
    answer:
      "Yes. Students, tutors, and admins get dashboard notifications. Students can also save favorite courses and tutors to a wishlist.",
  },
  {
    question: "Can sessions be added to Google Calendar?",
    answer:
      "Confirmed bookings can show a Google Meet or calendar link when calendar integration is configured. Students can also use the manual Add to Calendar option.",
  },
];

export default function FAQSection() {
  return (
    <section className="bg-gray-50 px-4 py-20 transition-colors dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Questions learners usually ask
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            Clear answers about payments, booking confirmation, cancellation,
            records, notifications, and how learning sessions work on
            MentorForge.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="rounded-lg border border-gray-200 bg-white px-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`question-${index}`}>
              <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline dark:text-white">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
