
# Core Backend - Node.js Authentication & User Management API

A robust Node.js backend application with user authentication, role-based access control, and comprehensive user management features.

## 🚀 Features

### User Features
- **User Registration & Login** - Secure authentication with JWT tokens
- **Profile Management** - View and update user profiles
- **File Upload** - Upload profile images/documents
- **Account Deletion** - Soft delete account (self-deletion)
- **Token Refresh** - Refresh expired access tokens

### Admin Features
- **Admin Authentication** - Separate admin login system
- **User List** - View all users with search and filters
- **User Status Management**:
  - Deactivate users (soft delete by admin)
  - Reactivate deactivated users
  - View deleted users (filtered by deletion type)
- **Role-based Access** - Admin-only routes protection

### Security Features
- JWT-based authentication
- Redis token storage & validation
- Password hashing with bcrypt
- HTTP-only secure cookies
- Role-based access control (RBAC)

## 📁 Project Structure

```
Core-backend/
├── config/
│   ├── index.js           # Main configuration
│   ├── developelemt.js     # Development config
│   └── Redis.js           # Redis client setup
├── src/
│   ├── index.js           # App entry point
│   ├── components/
│   │   ├── admin/         # Admin module
│   │   │   ├── controller/
│   │   │   ├── model/
│   │   │   ├── route.js
│   │   │   └── index.js
│   │   ├── user/          # User module
│   │   │   ├── controller/
│   │   │   ├── model/
│   │   │   ├── route.js
│   │   │   └── index.js
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js
│   │   └── utils/
│   │       ├── commonUtils.js
│   │       ├── enum.js
│   │       └── appString.js
│   └── uploads/          # File uploads
├── package.json
└── README.md
```

## 🔑 User Status Enum

| Status | Value | Description |
|--------|-------|-------------|
| ACTIVE | 1 | Normal active user |
| DEACTIVATED_BY_ADMIN | 2 | Admin deactivated user |
| DELETED_BY_USER | 3 | User self-deleted account |
| DELETED_BY_ADMIN | 4 | Admin deleted user account |

## 📡 API Endpoints

### Public Routes

#### User Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | User login |
| POST | `/api/logout` | User logout |
| GET | `/api/refresh-token` | Refresh access token |

#### Admin Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/register` | Register admin |
| POST | `/api/admin/login` | Admin login |

---

### Protected Routes (User)

#### Authentication
| Method | Endpoint | Headers | Description |
|--------|----------|---------|-------------|
| DELETE | `/api/delete-account` | Cookie: accessToken | Delete own account |
| PUT | `/api/update` | Cookie: accessToken | Update profile |

#### Profile Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| POST | `/api/upload` | Upload file/image |

---

### Protected Routes (Admin)

| Method | Endpoint | Headers | Description |
|--------|----------|---------|-------------|
| GET | `/api/admin/getallUser` | Authorization: Bearer \<token\> | Get all users |
| PUT | `/api/admin/users/:id/deactivate` | Authorization: Bearer \<token\> | Deactivate user |
| PUT | `/api/admin/users/:id/activate` | Authorization: Bearer \<token\> | Activate user |

#### User List Filters

| Query Parameter | Returns |
|----------------|---------|
| `?deletedUser=admin` | Users deleted by admin |
| `?deletedUser=user` | Users who self-deleted |
| `?deletedUser=all` | Both deleted types |
| No filter | All users (active + deleted) |

## 📝 API Request/Response Examples

### User Registration
```http
POST /api/register
Content-Type: application/json


```

## 🚫 Account Deletion Rules

### User Self-Deletion
- User can delete their own account
- **Cannot login again** after self-deletion
- **Admin cannot activate** a self-deleted user

### Admin Deletion
- Admin can deactivate active users
- Admin can reactivate deactivated users
- **Deleted user cannot login**
- **Admin can reactivate** admin-deleted users

## 🧪 Testing with Postman

1. **Login as User** → Get cookies
2. **Delete Account** → Use cookies
3. **Login as Admin** → Get token
4. **Get Deleted Users** → `GET /api/admin/getallUser?deletedUser=all`
5. **Try to Activate** → `PUT /api/admin/users/:id/activate`

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **redis** - Token storage
- **cookie-parser** - Cookie handling
- **multer** - File uploads
- **validatorjs** - Input validation

## 👤 Author

**Dhyey Chauhan**
- GitHub: [@Dhyey-chauhan](https://github.com/Dhyey-chauhan)

---

## 🔐 Security Notes

- Access tokens expire in 60 seconds (configurable)
- Refresh tokens valid for 7 days
- All tokens stored in Redis for validation
- Admin routes require Bearer token in Authorization header
- User routes require access token in cookies

