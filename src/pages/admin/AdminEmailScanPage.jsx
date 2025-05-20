import React, { useState } from "react";

function AdminEmailScanPage() {
    const [status, setStatus] = useState("");

    const handleScan = () => {
        fetch("http://localhost:8000/process-emails/", {
            method: "POST",
        })
            .then((res) => res.json())
            .then((data) => setStatus(data.message || "Đã gửi yêu cầu quét email"))
            .catch((err) => {
                console.error("Lỗi khi gọi API:", err);
                setStatus("❌ Lỗi khi gọi API backend");
            });
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Quét Email Ứng Tuyển</h2>
            <button
                onClick={handleScan}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
                Quét Email Ứng Tuyển
            </button>
            {status && <p className="mt-4 text-green-700">{status}</p>}
        </div>
    );
}

export default AdminEmailScanPage;
