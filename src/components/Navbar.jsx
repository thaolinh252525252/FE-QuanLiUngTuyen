import { Link } from "react-router-dom";
import "../App.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">Công ty ABC</div>
        <div>
            <a href="/" className="navbar-link">Trang chủ</a>
          <a href="/tra-cuu" className="navbar-link">Tra cứu kết quả</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

