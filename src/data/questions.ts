export interface Question {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
}

export const questions: Question[] = [
  {
    id: 1,
    text: "Một trong những chức năng cơ bản của Đoàn TNCS Hồ Chí Minh là:",
    options: [
      { id: "A", text: "Cơ quan quản lý hành chính" },
      { id: "B", text: "Đội dự bị tin cậy của Đảng Cộng sản Việt Nam" },
      { id: "C", text: "Cơ quan lập pháp của thanh niên" },
      { id: "D", text: "Tổ chức quân sự của thanh niên" }
    ],
    correctAnswer: "B"
  },
  {
    id: 2,
    text: "Theo quan điểm của Đảng, quân đội nhân dân Việt Nam mang bản chất của:",
    options: [
      { id: "A", text: "Giai cấp nông dân" },
      { id: "B", text: "Giai cấp công nhân" },
      { id: "C", text: "Giai cấp trí thức" },
      { id: "D", text: "Toàn thể nhân dân" }
    ],
    correctAnswer: "B"
  },
  {
    id: 3,
    text: "Một trong những nội dung trọng tâm trong chương trình hành động của tổ chức Đoàn trong Quân đội là:",
    options: [
      { id: "A", text: "Nâng cao đời sống vật chất" },
      { id: "B", text: "Phát huy vai trò xung kích, sáng tạo của thanh niên trong thực hiện nhiệm vụ quân sự, quốc phòng." },
      { id: "C", text: "Phát triển kinh tế địa phương" },
      { id: "D", text: "Hoạt động văn hóa giải trí" }
    ],
    correctAnswer: "B"
  },
  {
    id: 4,
    text: "Tổ chức tiền thân của Đoàn TNCS Hồ Chí Minh được thành lập vào ngày nào?",
    options: [
      { id: "A", text: "26/3/1930" },
      { id: "B", text: "26/3/1931" },
      { id: "C", text: "3/2/1930" },
      { id: "D", text: "19/5/1941" }
    ],
    correctAnswer: "B"
  },
  {
    id: 5,
    text: "Trải qua lịch sử phát triển, Đoàn TNCS Hồ Chí Minh đã bao nhiêu lần đổi tên?",
    options: [
      { id: "A", text: "5 lần" },
      { id: "B", text: "6 lần" },
      { id: "C", text: "7 lần" },
      { id: "D", text: "8 lần" }
    ],
    correctAnswer: "C"
  },
  {
    id: 6,
    text: "Người sáng lập và rèn luyện Đoàn TNCS Hồ Chí Minh là ai?",
    options: [
      { id: "A", text: "Võ Nguyên Giáp" },
      { id: "B", text: "Trường Chinh" },
      { id: "C", text: "Hồ Chí Minh" },
      { id: "D", text: "Lê Duẩn" }
    ],
    correctAnswer: "C"
  },
  {
    id: 7,
    text: "Chuyển đổi số trong công tác Đoàn được hiểu là:",
    options: [
      { id: "A", text: "Chỉ sử dụng máy tính" },
      { id: "B", text: "Ứng dụng công nghệ số để nâng cao hiệu quả quản lý, điều hành và tổ chức hoạt động đoàn" },
      { id: "C", text: "Chỉ dùng mạng xã hội" },
      { id: "D", text: "Chỉ lưu trữ dữ liệu" }
    ],
    correctAnswer: "B"
  },
  {
    id: 8,
    text: "Ngày thành lập Chi đoàn Thanh niên Cứu quốc đầu tiên trong Quân đội là:",
    options: [
      { id: "A", text: "19/5/1951" },
      { id: "B", text: "8/2/1951" },
      { id: "C", text: "26/3/1951" },
      { id: "D", text: "22/12/1951" }
    ],
    correctAnswer: "B"
  },
  {
    id: 9,
    text: "Ngày truyền thống Thanh niên Quân đội và Ban Thanh niên Quân đội là ngày nào?",
    options: [
      { id: "A", text: "26/3" },
      { id: "B", text: "22/12" },
      { id: "C", text: "8/2" },
      { id: "D", text: "19/5" }
    ],
    correctAnswer: "C"
  },
  {
    id: 10,
    text: "Bối cảnh thế giới có những điểm nổi bật nào trong thời điểm diễn ra Đại hội XIV của Đảng?",
    options: [
      { id: "A", text: "Hoạt động quân sự đang leo thang ở tất cả các nước lớn" },
      { id: "B", text: "Cạnh tranh chiến lược gay gắt giữa các nước lớn" },
      { id: "C", text: "Kinh tế thế giới rơi vào khủng hoảng trầm trọng" },
      { id: "D", text: "Không có xung đột xảy ra giữa các nước" }
    ],
    correctAnswer: "B"
  },
  {
    id: 11,
    text: "Chủ đề Đại hội XIV tiếp tục nhấn mạnh nhiệm vụ trọng tâm nào?",
    options: [
      { id: "A", text: "Tiếp tục phát triển nông nghiệp theo hướng truyền thống" },
      { id: "B", text: "Xây dựng, chỉnh đốn Đảng" },
      { id: "C", text: "Giảm chi tiêu quốc phòng" },
      { id: "D", text: "Đẩy mạnh phát triển kinh tế Nhà nước" }
    ],
    correctAnswer: "B"
  },
  {
    id: 12,
    text: "Đại hội XIV của Đảng kế thừa và phát triển đường lối của các kỳ đại hội trước trên cơ sở?",
    options: [
      { id: "A", text: "Đổi mới toàn diện tư tưởng và thể chế" },
      { id: "B", text: "Phát triển nhanh đất nước cả về quy mô và tầm vóc" },
      { id: "C", text: "Từng bước xóa bỏ kinh tế thị trường" },
      { id: "D", text: "Kiên định và vận dụng sáng tạo chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh" }
    ],
    correctAnswer: "D"
  },
  {
    id: 13,
    text: "Văn kiện Đại hội XIV xác định xu thế lớn của thế giới hiện nay là gì?",
    options: [
      { id: "A", text: "Cấm vận các nước nhỏ để mở rộng quy mô kinh tế" },
      { id: "B", text: "Đẩy mạnh xung đột quân sự để hưởng lợi kinh tế" },
      { id: "C", text: "Hợp tác và phát triển nhưng cạnh tranh gay gắt" },
      { id: "D", text: "Biệt lập, tự chủ về kinh tế" }
    ],
    correctAnswer: "C"
  },
  {
    id: 14,
    text: "Thành tựu của đất nước ta sau gần 40 năm đổi mới?",
    options: [
      { id: "A", text: "Có nhưng chưa rõ nét" },
      { id: "B", text: "Nền kinh tế lệ thuộc vào nước ngoài" },
      { id: "C", text: "Kinh tế tư nhân là xương sống của kinh tế cả nước" },
      { id: "D", text: "Thành tựu to lớn, có ý nghĩa lịch sử" }
    ],
    correctAnswer: "D"
  },
  {
    id: 15,
    text: "Yêu cầu phát triển đất nước trong giai đoạn mới là gì?",
    options: [
      { id: "A", text: "Phát triển bền vững nền kinh tế Nhà nước là chủ đạo" },
      { id: "B", text: "Phát triển bền vững, bao trùm" },
      { id: "C", text: "Chú trọng phát triển nông nghiệp theo hướng truyền thống" },
      { id: "D", text: "Tập trung phát triển kinh tế đô thị là trọng tâm" }
    ],
    correctAnswer: "B"
  },
  {
    id: 16,
    text: "Đại hội XIV xác định mục tiêu tổng quát của cả nhiệm kỳ là gì?",
    options: [
      { id: "A", text: "Phát triển nhanh và bền vững đất nước" },
      { id: "B", text: "Tăng quy mô dân số" },
      { id: "C", text: "Giữ nguyên trạng" },
      { id: "D", text: "Thu hẹp thị trường nội địa" }
    ],
    correctAnswer: "C"
  },
  {
    id: 17,
    text: "Mục tiêu dài hạn đến giữa thế kỷ XXI được xác định trong văn kiện Đại hội XIV của Đảng là gì?",
    options: [
      { id: "A", text: "Trở thành nước đang phát triển, thu nhập trung bình cao" },
      { id: "B", text: "Trở thành nước đang phát triển, thu nhập cao" },
      { id: "C", text: "Trở thành nước phát triển, thu nhập trung bình cao" },
      { id: "D", text: "Trở thành nước phát triển, thu nhập cao" }
    ],
    correctAnswer: "D"
  },
  {
    id: 18,
    text: "Đại hội XIV xác định phát triển con người toàn diện phải gắn liền?",
    options: [
      { id: "A", text: "Tăng thương mại thuần túy" },
      { id: "B", text: "Từng bước loại bỏ các yếu tố văn hóa truyền thống" },
      { id: "C", text: "Xây dựng nền văn hóa tiên tiến, đậm đà bản sắc dân tộc" },
      { id: "D", text: "Tối giản hóa chính sách an sinh xã hội" }
    ],
    correctAnswer: "C"
  },
  {
    id: 19,
    text: "Những đột phá chiến lược tiếp tục được Đại hội Đảng XIV xác định gồm những nội dung nào?",
    options: [
      { id: "A", text: "Thể chế, cơ chế, nguồn cung" },
      { id: "B", text: "Cơ chế, nhân lực, nguồn cung" },
      { id: "C", text: "Thể chế, nhân lực, hạ tầng" },
      { id: "D", text: "Thể chế, cơ chế, hạ tầng" }
    ],
    correctAnswer: "C"
  },
  {
    id: 20,
    text: "Mục tiêu tổng quát của công tác xây dựng Đảng trong nhiệm kỳ Đại hội XIV là gì?",
    options: [
      { id: "A", text: "Nâng cao vai trò lãnh đạo của cán bộ, đảng viên" },
      { id: "B", text: "Nâng cao năng lực lãnh đạo, cầm quyền của Đảng" },
      { id: "C", text: "Nâng cao năng lực quản lý của Nhà nước" },
      { id: "D", text: "Thể chế hóa bộ máy Nhà nước" }
    ],
    correctAnswer: "B"
  },
  {
    id: 21,
    text: "Xây dựng Đảng về đạo đức được nhấn mạnh trong văn kiện Đại hội XIV của Đảng nhằm hướng tới mục tiêu gì?",
    options: [
      { id: "A", text: "Khẳng định vai trò nêu gương của cán bộ, đảng viên" },
      { id: "B", text: "Giới hạn quyền lực cá nhân" },
      { id: "C", text: "Giữ gìn phẩm chất cách mạng, chống suy thoái" },
      { id: "D", text: "Gắn trách nhiệm đối với người đứng đầu tổ chức đảng" }
    ],
    correctAnswer: "C"
  },
  {
    id: 22,
    text: "Trong văn kiện Đại hội XIV của Đảng xác định xây dựng nền quốc phòng toàn dân phải gắn với nội dung nào?",
    options: [
      { id: "A", text: "Thế trận lòng dân vững chắc" },
      { id: "B", text: "Thế trận an ninh nhân dân" },
      { id: "C", text: "Nền an ninh nhân dân" },
      { id: "D", text: "Bảo đảm đời sống Nhân dân" }
    ],
    correctAnswer: "B"
  },
  {
    id: 23,
    text: "Văn kiện Đại hội XIV xác định nâng cao chất lượng nguồn nhân lực là gì?",
    options: [
      { id: "A", text: "Nhiệm vụ dài hạn mang tính khách quan" },
      { id: "B", text: "Yếu tố phụ, chưa cấp thiết" },
      { id: "C", text: "Yếu tố quyết định thành công" },
      { id: "D", text: "Phụ thuộc vào xu thế phát triển của các nước lớn" }
    ],
    correctAnswer: "C"
  },
  {
    id: 24,
    text: "Đại hội XIV xác định mục tiêu xây dựng Quân đội nhân dân theo hướng như thế nào?",
    options: [
      { id: "A", text: "Tăng về số lượng" },
      { id: "B", text: "Chính quy, từng bước hiện đại" },
      { id: "C", text: "Tinh nhuệ, mở rộng tổ chức" },
      { id: "D", text: "Tinh, gọn, mạnh" }
    ],
    correctAnswer: "D"
  },
  {
    id: 25,
    text: "Văn kiện Đại hội XIV xác định vai trò của khoa học - công nghệ như thế nào?",
    options: [
      { id: "A", text: "Thứ yếu trong phát triển đất nước" },
      { id: "B", text: "Chưa thực sự quan trọng" },
      { id: "C", text: "Động lực then chốt" },
      { id: "D", text: "Chủ đạo chỉ dùng trong nghiên cứu hàn lâm" }
    ],
    correctAnswer: "C"
  }
];
