# Hướng dẫn test API với Postman

## Bước 1: Khởi động server

Mở terminal trong thư mục `backend`, chạy:

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

---

## Bước 2: Kiểm tra server đang chạy (Health Check)

| Field  | Value                            |
|--------|----------------------------------|
| Method | GET                              |
| URL    | `http://localhost:3000/api/health` |

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-20T..."
}
```

---

## Bước 3: Đăng ký tài khoản mới (Register)

| Field  | Value                               |
|--------|-------------------------------------|
| Method | POST                                |
| URL    | `http://localhost:3000/api/auth/register` |

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Nguyen Van A",
  "email": "test@example.com",
  "password": "123456"
}
```

**Expected response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "name": "Nguyen Van A",
    "email": "test@example.com",
    "createdAt": "..."
  }
}
```

> Lưu lại giá trị `token` để dùng ở các bước sau.

---

## Bước 4: Đăng nhập (Login)

| Field  | Value                             |
|--------|-----------------------------------|
| Method | POST                              |
| URL    | `http://localhost:3000/api/auth/login` |

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

**Expected response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "name": "Nguyen Van A",
    "email": "test@example.com"
  }
}
```

---

## Bước 5: Lấy thông tin user hiện tại (Get Me)

| Field  | Value                           |
|--------|---------------------------------|
| Method | GET                             |
| URL    | `http://localhost:3000/api/auth/me` |

**Headers:**
```
Authorization: Bearer <token_lấy_từ_bước_3_hoặc_4>
```

**Expected response (200):**
```json
{
  "user": {
    "id": "...",
    "name": "Nguyen Van A",
    "email": "test@example.com",
    "createdAt": "..."
  }
}
```

---

## Các trường hợp test lỗi

### Đăng ký thiếu field
**Body:**
```json
{
  "email": "test@example.com"
}
```
**Expected:** 400 - `"Name, email and password are required"`

### Đăng ký email đã tồn tại
Gửi lại request đăng ký với cùng email.
**Expected:** 400 - `"User with this email already exists"`

### Login sai mật khẩu
```json
{
  "email": "test@example.com",
  "password": "saimatkhau"
}
```
**Expected:** 400 - `"Invalid email or password"`

### Gọi /me không có token
Không truyền header Authorization.
**Expected:** 401 - `"Unauthorized"`

### Gọi /me với token sai
```
Authorization: Bearer tokengiamao
```
**Expected:** 401 - `"Invalid token"`
