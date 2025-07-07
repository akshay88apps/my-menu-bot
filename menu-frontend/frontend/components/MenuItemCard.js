// components/MenuItemCard.js
import React from 'react';
import styles from '../styles/MenuItemCard.module.css';

const MenuItemCard = ({ item, onAddItem }) => {
    return (
        <div className={styles.card}>
            <h3 className={styles.dishName}>{item.dish_name}</h3>
            <p className={styles.price}>₹{item.price}</p>
            <p className={styles.description}>{item.description}</p>
            <button onClick={() => onAddItem(item)} className={styles.addButton}>Add</button>
        </div>
    );
};

export default MenuItemCard;
