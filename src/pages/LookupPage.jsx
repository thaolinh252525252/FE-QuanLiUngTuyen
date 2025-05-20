import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function LookupPage() {
  const [phone, setPhone] = useState("");
  const [info, setInfo] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!phone) return;
    setLoading(true);
    setMessage("");
    setInfo(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/candidates/lookup?phone=${phone}`);
      const data = await res.json();

      if (data.found) {
        setInfo(data);
        const msg = getMessageFromResult(data.ket_qua, data.trang_thai);
        setMessage(msg);
      } else {
        setMessage("❌ Không tìm thấy ứng viên với số điện thoại này.");
      }

    } catch (err) {
      setMessage("🚫 Lỗi khi tra cứu. Vui lòng thử lại.");
      console.error(err);
    }
    setLoading(false);
  };
  const getMessageFromResult = (ket_qua, trang_thai) => {
    if (!ket_qua) {
      if (trang_thai?.toLowerCase().includes("đang ứng tuyển")) {
        return "📩 Chưa có kết quả ứng tuyển. Vui lòng kiểm tra lại sau.";
      }
      return "📨 Hồ sơ của bạn đang được xem xét.";
    }

    if (ket_qua === "Pass" && trang_thai === "Chờ phỏng vấn") {
      return "🎉 Chúc mừng bạn đã qua vòng CV. Bạn sẽ nhận lịch phỏng vấn qua email sớm nhất!";
    }
    if (ket_qua === "Pass" && trang_thai === "Đã lên lịch phỏng vấn") {
      return "🎉 Chúc mừng bạn đã qua vòng CV. Hãy kiểm tra email lịch phỏng vấn đã được gửi tới bạn!";
    }

    if (ket_qua === "Fail CV") {
      return "❌ Rất tiếc! Hồ sơ của bạn chưa phù hợp với vị trí tuyển dụng.";
    }

    if (ket_qua === "Fail Interview") {
      return "❌ Cảm ơn bạn đã tham gia phỏng vấn. Rất tiếc bạn chưa vượt qua vòng này.";
    }
    msg_kq = ""
    if (ket_qua == "Pass") {
      msg_kq = "Qua CV"
    } else if (ket_qua == "Fail CV") {
      msg_kq = "Không qua vòng CV"
    } else {
      msg_kq = "Không qua vòng phỏng vấn"
    }

    return `📌 Trạng thái hiện tại: ${msg_kq}`;
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: "40px" }}>
        <h2 className="section-title">🔍 Tra cứu kết quả tuyển dụng</h2>
        <input
          type="text"
          placeholder="Nhập số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: "10px", width: "100%", maxWidth: "400px", borderRadius: "6px", marginBottom: "12px" }}
        />
        <br />
        <button onClick={handleLookup} className="btn-primary" style={{ padding: "10px 24px" }}>
          {loading ? "Đang tra cứu..." : "Tra cứu"}
        </button>

        {message && (
          <div style={{ marginTop: "20px", fontSize: "16px", color: "#333", fontWeight: 500 }}>
            {message}
          </div>
        )}

        {info && (
          <div style={{ marginTop: "24px", border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
            <h3>Thông tin ứng viên:</h3>
            <p><strong>Họ tên:</strong> {info.ho_ten}</p>
            <p><strong>Email:</strong> {info.email}</p>
            <p><strong>Số điện thoại:</strong> {info.so_dien_thoai}</p>
            <p><strong>CCCD:</strong> {info.cccd || "N/A"}</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default LookupPage;
