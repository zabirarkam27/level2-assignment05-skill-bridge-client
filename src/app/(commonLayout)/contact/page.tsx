import { ContactForm } from "@/components/contact/ContactForm";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const contactCards = [
  {
    icon: Mail,
    title: "Email",
    value: "support@skillbridge.com",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+880 1234 567890",
  },
  {
    icon: MapPin,
    title: "Office",
    value: "123 SkillBridge Ave, Dhaka",
  },
];

export const metadata = {
  title: "Contact Us | SkillBridge",
  description:
    "Contact the SkillBridge team for support, partnership, and learning help.",
};

export default function ContactPage() {
  return (
    <div className="min-h-[80vh] bg-white dark:bg-gray-950">
      <section className="border-b bg-linear-to-b from-[#611f69]/5 to-transparent px-6 py-14 dark:from-[#c084fc]/10">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#611f69]/10 text-[#611f69] dark:bg-[#c084fc]/15 dark:text-[#c084fc]">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
            Need help choosing a tutor, managing a booking, or joining as a
            mentor? Send us a message and the SkillBridge team will get back to
            you.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
        <div className="space-y-4">
          {contactCards.map(({ icon: Icon, title, value }) => (
            <div
              key={title}
              className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#611f69]/10 text-[#611f69] dark:bg-[#c084fc]/15 dark:text-[#c084fc]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {title}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ContactForm />
      </section>
    </div>
  );
}
