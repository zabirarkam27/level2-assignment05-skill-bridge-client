"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I book a tutor on Skill Bridge?",
    answer:
      "Browse mentors or courses, open a tutor profile, choose an available slot, and submit a booking request. Your booking will appear in your student dashboard.",
  },
  {
    question: "Do I need to pay online before booking?",
    answer:
      "No. Skill Bridge follows a cash on delivery style flow for this project. Students can book sessions without online payment integration.",
  },
  {
    question: "Can anyone become a tutor immediately?",
    answer:
      "Tutor accounts go through admin review first. After approval, tutors can create their profile, manage availability, and handle sessions.",
  },
  {
    question: "When can students leave a review?",
    answer:
      "Students can leave a review after a booked session is marked completed. This keeps testimonials connected to real learning activity.",
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
            Clear answers about booking, tutor approval, reviews, and how
            learning sessions work on Skill Bridge.
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
