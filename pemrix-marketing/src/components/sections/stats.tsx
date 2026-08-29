"use client";

import { motion } from "motion/react";

import { NumberTicker } from "@/components/magicui/number-ticker";

const STATS = [
  { value: 99.99, suffix: "%", label: "Network uptime" },
  { value: 2.4, suffix: "B+", label: "Transactions settled" },
  { value: 12400, suffix: "+", label: "Validators" },
  { value: 180, suffix: "+", label: "Countries" },
];

export default function Stats() {
  return (
    <section className="section-padding relative overflow-hidden bg-[#02030a]">
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl leading-tight tracking-tight text-white md:text-5xl">
            Trusted at scale
          </h2>
          <p className="mt-4 text-lg text-white/60">
            A growing, global network built for real-world volume from day one.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ value, suffix, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col items-center justify-center bg-[#02030a] p-8 text-center"
            >
              <div className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                <NumberTicker value={value} decimalPlaces={value % 1 !== 0 ? 2 : 0} />
                {suffix}
              </div>
              <p className="mt-2 text-white/55">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
