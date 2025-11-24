import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import './Fairy.css';

const Fairy = ({ id, x, y, energy, maxEnergy, state, variant = 'standard', onDrag, onDrop }) => {
    const nodeRef = useRef(null);

    // Calculate visual health
    const healthPercent = energy / maxEnergy;
    let filterStyle = '';

    // Base variant filters
    let variantFilter = '';
    if (variant === 'swift') variantFilter = 'hue-rotate(90deg) saturate(1.2)'; // Green
    if (variant === 'durable') variantFilter = 'hue-rotate(290deg) saturate(1.1)'; // Pink/Purple

    // Health overlays
    if (healthPercent < 0.2) {
        // Danger: Red tint overrides variant slightly but keeps hue shift if possible, 
        // but simple sepia is clearer for "danger".
        filterStyle = `sepia(1) hue-rotate(-15deg) saturate(8) brightness(1.2)`;
    } else if (healthPercent < 0.5) {
        // Warning: Orange tint
        filterStyle = `sepia(1) hue-rotate(30deg) saturate(8) brightness(1)`;
    } else {
        filterStyle = variantFilter;
    }

    return (
        <motion.div
            className={`fairy ${variant}`}
            style={{
                x,
                y,
                filter: filterStyle
            }}
            drag
            dragMomentum={false}
            onDrag={(event, info) => {
                const parent = nodeRef.current?.parentElement;
                if (parent) {
                    // Use offset (total distance from start of drag) because x/y props are not updating during drag
                    onDrag(id, x + info.offset.x, y + info.offset.y);
                }
            }}
            onDragStart={() => onDrag(id, x, y)}
            onDragEnd={() => onDrop(id)}
            ref={nodeRef}
        >
            <div className="fairy-sprite" />
            {variant === 'swift' && <div className="wing-trail"></div>}
        </motion.div>
    );
};

export default Fairy;
