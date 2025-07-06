// components/OrderPane.js
import React from 'react';
import styles from '../styles/OrderPane.module.css';

const OrderPane = ({ orderItems, onUpdateItemQuantity, onRemoveItem, onConfirmOrder }) => {
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className={styles.orderPaneContainer}>
            <h2>Your Order</h2>
            {orderItems.length === 0 ? (
                <p>Your order is empty.</p>
            ) : (
                <>
                    <ul className={styles.orderList}>
                        {orderItems.map(item => (
                            <li key={item.dish_id} className={styles.orderItem}>
                                <span>{item.dish_name} (x{item.quantity})</span>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                <div className={styles.itemControls}>
                                    <button onClick={() => onUpdateItemQuantity(item.dish_id, item.quantity - 1)}>-</button>
                                    <button onClick={() => onUpdateItemQuantity(item.dish_id, item.quantity + 1)}>+</button>
                                    <button onClick={() => onRemoveItem(item.dish_id)} className={styles.removeButton}>X</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.orderTotal}>
                        <strong>Total: ₹{total.toFixed(2)}</strong>
                    </div>
                    <button onClick={onConfirmOrder} className={styles.confirmButton}>Confirm Order</button>
                </>
            )}
        </div>
    );
};

export default OrderPane;
