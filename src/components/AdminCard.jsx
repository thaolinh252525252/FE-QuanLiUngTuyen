function AdminCard({ title, children }) {
  return (
    <div className="admin-card">
      <h2 style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>{title}</h2>
      {children}
    </div>
  );
}

export default AdminCard;
