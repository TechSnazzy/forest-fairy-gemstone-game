import React from 'react';
import { motion } from 'framer-motion';
import './Gem.css';

const Gem = ({ x, y, type = 'common' }) => {
    return (
        <motion.div
            className={`gem ${type}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ left: x, top: y }}
        >
            <div className="gem-sprite" />
            <div className="sparkle s1">✦</div>
            <div className="sparkle s2">✦</div>
            {type === 'legendary' && <div className="sparkle s3">✦</div>}
        </motion.div>
    );
};

export default Gem;
