# 🛒 Bazuuyu Backend API – Mobile Store Demo

Đây là project backend RESTful API cho hệ thống bán hàng **Mobile Store**, xây dựng bằng **Java Spring Boot** với đầy đủ chức năng:

- Quản lý sản phẩm
- Giỏ hàng (Cart)
- Đăng nhập/Đăng ký khách hàng & admin
- Xác thực bằng JWT
- Upload ảnh bằng Cloudinary
- Đặt lại mật khẩu qua email

✅ **Toàn bộ API đã test thành công bằng Postman**

---

## 🚀 Công nghệ

- Java 17 + Spring Boot 3
- Spring Security + JWT
- MySQL + JPA
- Cloudinary (upload ảnh)
- Postman (test API)

---

## 🧪 Demo nhanh các chức năng

### 👤 Auth API
- `POST /api/customers/register` – Đăng ký khách hàng
- `POST /api/customers/login` – Đăng nhập lấy JWT
- `POST /api/admins/login` – Đăng nhập admin OR super admin
- `POST /api/admins/create` – Tạo admin (SUPER_ADMIN)

### 🛍️ Product API
- `GET /api/products` – Xem danh sách sản phẩm
- `GET /api/products/{id}` – Xem chi tiết
- `POST /api/products` – Thêm sản phẩm
- `PUT /api/products/{id}` – Cập nhật
- `DELETE /api/products/{id}` – Xoá

### 🛒 Cart API
- `POST /api/cart/items` – Thêm vào giỏ
- `GET /api/cart/customer/{id}` – Lấy giỏ hiện tại
- `POST /api/cart/checkout/{id}` – Thanh toán

### 🔁 Đặt lại mật khẩu
- `POST /api/password/send-reset-token` – Gửi email reset
- `POST /api/password/reset` – Reset mật khẩu mới

### ☁️ Upload
- `POST /api/upload` – Tải ảnh lên Cloudinary

---

## 🧑‍💻 Cách chạy project

```bash
# Clone và chạy
git clone https://github.com/your-username/bazuuyu-backend.git
cd bazuuyu-backend

# Cấu hình file application.properties:
# - MySQL connection
# - JWT secret
# - Cloudinary API key

# Chạy
./mvnw spring-boot:run
