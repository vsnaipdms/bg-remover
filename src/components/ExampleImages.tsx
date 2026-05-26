"use client";

import { motion } from "framer-motion";

const examples = [
  {
    label: "Portrait",
    original: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
  },
  {
    label: "Product",
    original: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80",
  },
  {
    label: "Pet",
    original: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&q=80",
  },
  {
    label: "Nature",
    original: "https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=300&q=80",
  },
];

interface ExampleImagesProps {
  onSelect: (url: string) => void;
}

export default function ExampleImages({ onSelect }: ExampleImagesProps) {
  return (
    <section className="w-full py-12 md:py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Try with sample images
          </h2>
          <p className="mt-2 text-gray-500">
            Click any image to see the magic
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {examples.map((example, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(example.original)}
              className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="aspect-[3/4]">
                <img
                  src={example.original}
                  alt={example.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                <span className="text-white text-sm font-medium">
                  {example.label}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
