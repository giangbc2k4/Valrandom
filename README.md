# Valrandom

Ứng dụng Next.js dùng để xáo trộn người chơi, chia đội và hiển thị kết quả có hiệu ứng. Giao diện có trình phát nhạc và hỗ trợ nội dung đa ngôn ngữ.

## Tính năng

- Nhập và quản lý người chơi.
- Logic chia đội ngẫu nhiên.
- Màn hình hiển thị kết quả chia đội.
- Tiện ích gán agent/đội.
- Component header và trình phát nhạc.
- Tiện ích đa ngôn ngữ.
- Hiệu ứng Framer Motion và particles.

## Công nghệ

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- lucide-react
- tsparticles

## Cấu trúc dự án

```text
app/page.tsx                 Main app screen
app/players/                 Player setup flow
app/teams/                   Team setup flow
app/result/                  Result display
app/lib/teamRandomizer.ts    Team randomization logic
app/lib/assignAgents.ts      Agent assignment logic
app/lib/i18n.tsx             Text/localization helper
app/components/              Shared UI components
```

## Cài đặt và chạy

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Lệnh npm

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Hướng phát triển

- Bổ sung ảnh màn hình hoặc GIF demo.
- Tài liệu hóa chính xác quy tắc ngẫu nhiên.
- Đổi tên package từ `my-app` thành `valrandom`.

## Luồng người dùng và logic nghiệp vụ

The landing page leads to player entry, team configuration and the result screen. Keep randomization in `app/lib/teamRandomizer.ts` and agent assignment in `assignAgents.ts`; UI components should not duplicate those rules. Agent/map metadata and matching assets must use stable, consistent IDs.

## Quy tắc công bằng cần tài liệu hóa

Cần nêu rõ số người tối thiểu/tối đa, cách xử lý số người lẻ, agent có được trùng không, role có cần cân bằng không và cách chọn map. Shuffle tạo kết quả ngẫu nhiên nhưng không đồng nghĩa cân bằng kỹ năng. Nếu cần tái tạo kết quả, hãy thêm seed và hiển thị seed ở trang kết quả.

## Kiểm thử và production

Kiểm thử 0/1 người chơi, số lượng lẻ, tên trùng, số đội nhiều hơn người, thiếu asset và refresh trực tiếp `/result` khi chưa có state. Kiểm tra mobile, reduced-motion và trình duyệt chặn audio autoplay. Trước khi công khai, chạy lint/build, tối ưu ảnh lớn và xác nhận quyền sử dụng hình/âm thanh Valorant. Dùng URL/localStorage nếu muốn kết quả tồn tại sau refresh hoặc có thể chia sẻ.
