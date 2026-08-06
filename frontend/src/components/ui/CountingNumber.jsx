import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const CountingNumber = ({ value, duration = 1.2 }) => {
  // Parse the input value, stripping commas
  const stringValue = typeof value === 'string' ? value.replace(/,/g, '') : value;
  const numValue = parseFloat(stringValue);

  // Determine formatting based on input
  const hasDecimals = stringValue.toString().includes('.');
  const isCommaFormatted = typeof value === 'string' && value.includes(',');

  const count = useMotionValue(0);

  // Transform the raw motion value into a formatted string
  const rounded = useTransform(count, (latest) => {
    let formatted = hasDecimals ? latest.toFixed(2) : Math.round(latest).toString();
    if (isCommaFormatted) {
      // Add commas back
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formatted = parts.join('.');
    }
    return formatted;
  });

  useEffect(() => {
    if (!isNaN(numValue)) {
      const controls = animate(count, numValue, {
        duration,
        ease: 'easeOut',
      });
      return controls.stop;
    } else {
      count.set(0);
    }
  }, [numValue, duration, count]);

  if (isNaN(numValue)) return <span>{value}</span>;

  return <motion.span>{rounded}</motion.span>;
};

export default CountingNumber;
