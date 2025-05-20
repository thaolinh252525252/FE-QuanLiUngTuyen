import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";

const API_URL = import.meta.env.VITE_BACKEND_URL + "/candidates/";

function PotentialEmailsPage() {
    const navigate = useNavigate();
    const [positions, setPositions] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [selected, setSelected] = useState("");

    // Lấy danh sách vị trí có JD + tất cả ứng viên
    useEffect(() => {
        // Lấy danh sách vị trí hợp lệ từ bảng JD
        fetch(API_URL + "potential-positions")
            .then((res) => res.json())
            .then((data) => {
                setPositions(Array.isArray(data) ? data : []);
            })
            .catch((error) => {
                console.error("Lỗi khi tải danh sách vị trí:", error);
            });

        // Lấy toàn bộ ứng viên
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) => {
                const normalizedData = data.map((c) => ({
                    ...c,
                    diem_phu_hop: parseFloat(c.diem_phu_hop) || 0,
                }));
                setCandidates(normalizedData);
                setFiltered(normalizedData); // Hiển thị tất cả ứng viên ban đầu
            })
            .catch((error) => {
                console.error("Lỗi khi tải dữ liệu ứng viên:", error);
            });
    }, []);

    // Lọc ứng viên theo vị trí khi chọn
    useEffect(() => {
        if (selected) {
            const list = candidates
                .filter((c) => c.vi_tri_ung_tuyen.toLowerCase() === selected.toLowerCase())
                .sort((a, b) => b.diem_phu_hop - a.diem_phu_hop);
            setFiltered(list);
        } else {
            setFiltered(candidates); // Hiển thị tất cả nếu không chọn vị trí
        }
    }, [selected, candidates]);

    // Format điểm phù hợp
    const formatScore = (score) => {
        if (score === undefined || score === null) return "0";
        const numScore = parseFloat(score);
        return isNaN(numScore) ? "0" : numScore.toFixed(1);
    };

    // Hàm chuyển hướng đến trang chi tiết ứng viên
    const goToDetail = (candidateId) => {
        navigate(`/admin/candidates/${candidateId}`);
    };

    return (
        <AdminLayout>
            <div className="admin-card">
                <h2>📧 Danh sách Email Ứng viên Tiềm năng</h2>

                <label className="block text-sm font-medium mb-1">
                    Chọn vị trí ứng tuyển
                </label>
                <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">-- Chọn vị trí ứng tuyển --</option>
                    {positions.map((p, idx) => (
                        <option key={idx} value={p}>
                            {p}
                        </option>
                    ))}
                </select>

                <p className="mt-4">
                    {selected ? (
                        <>Đã chọn vị trí: <strong>{selected}</strong></>
                    ) : (
                        <>Hiển thị tất cả ứng viên</>
                    )}
                </p>
                <table className="candidate-table mt-4 w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">Họ tên</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Vị trí ứng tuyển</th>
                            <th className="p-2 border">Điểm phù hợp</th>
                            <th className="p-2 border">Kỹ năng</th>
                            <th className="p-2 border">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map((c) => (
                                <tr key={c.id}>
                                    <td className="p-2 border">{c.ho_ten || "-"}</td>
                                    <td className="p-2 border">{c.email || "-"}</td>
                                    <td className="p-2 border">{c.vi_tri_ung_tuyen || "-"}</td>
                                    <td className="p-2 border">{formatScore(c.diem_phu_hop)}</td>
                                    <td className="p-2 border">
                                        {Array.isArray(c.ky_nang) ? c.ky_nang.join(", ") : "-"}
                                    </td>
                                    <td className="p-2 border">
                                        <button
                                            onClick={() => goToDetail(c.id)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm transition-colors duration-200"
                                        >
                                            <i className="bi bi-eye me-1"></i> Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-4 text-center">
                                    Không có ứng viên nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <p className="mt-2">Tổng số: {filtered.length} ứng viên</p>
            </div>
        </AdminLayout>
    );
}

export default PotentialEmailsPage;