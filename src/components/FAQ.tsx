"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Is this really free?",
    answer:
      "Yes! You can remove backgrounds from images completely free of charge. No credit card or signup required.",
  },
  {
    question: "What image formats are supported?",
    answer:
      "We support JPG, PNG, and WEBP formats. The output is always a high-quality transparent PNG.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Yes, the maximum file size is 10MB. For best results, we recommend images between 500KB and 5MB.",
  },
  {
    question: "Are my images stored permanently?",
    answer:
      "No. All images are processed in real-time and automatically deleted from our servers immediately after processing. We never store your images.",
  },
  {
    question: "How accurate is the background removal?",
    answer:
      "Our AI-powered tool is highly accurate for images with clear subjects, people, products, and pets. Complex backgrounds may require manual touch-ups.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "Not at all. Just upload your image and download the result — no registration, no emails, no hassle.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full py-16 md:py-24 px-4" id="faq">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Everything you need to know
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="font-medium text-gray-800 pr-4">
                  {faq.question}
                </span>
                <motion.svg
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 text-primary-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
