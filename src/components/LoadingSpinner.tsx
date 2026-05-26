"use client";

import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative w-20 h-20">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary-200"
          style={{ borderTopColor: "transparent" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-accent-300"
          style={{ borderTopColor: "transparent" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
        </motion.div>
      </div>
      <motion.p
        className="text-gray-500 font-medium text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Removing background...
      </motion.p>
    </div>
  );
}
