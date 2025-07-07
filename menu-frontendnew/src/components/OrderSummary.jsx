// -------------------- OrderSummary.jsx --------------------
export const OrderSummary = ({ order }) => {
  const total = order.reduce((sum, item) => sum + (item.price || 0), 0);
  return (
    <aside className="w-64 bg-white p-4 border-r hidden md:block">
      <h2 className="font-bold text-lg mb-2">Order Summary</h2>
      {order.map((item, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span>{item.dish_name}</span>
          <span>${item.price?.toFixed(2)}</span>
        </div>
      ))}
      <hr className="my-2" />
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded w-full">Confirm Order</button>
    </aside>
  );
};
