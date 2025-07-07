// -------------------- Header.jsx --------------------
export const Header = ({ clearOrder }) => (
  <header className="p-4 bg-white shadow w-full text-center">
    <h1 className="text-xl font-semibold">Welcome to your own restaurant - XXX</h1>
    <button className="text-blue-600 underline mt-2" onClick={() => window.open("/menu.pdf", "_blank")}>View Full Menu</button>
  </header>
);
