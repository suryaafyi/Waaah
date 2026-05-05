import React from 'react';
import { motion } from 'framer-motion';
import './ChipGroup.css';

const ChipGroup = ({ options, selected, onSelect, color }) => {
  return (
    <motion.div 
      className="chip-group-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <motion.button
            key={option}
            type="button"
            className={`chip-button ${isSelected ? 'chip-button-selected' : ''}`}
            onClick={() => onSelect(option)}
            whileTap={{ scale: 0.95 }}
            animate={
              isSelected 
                ? { scale: 1.03, backgroundColor: color } 
                : { scale: 1, backgroundColor: 'var(--chip-bg)' }
            }
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {option}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default ChipGroup;
