# 🏆 Sports Athlete Platform

A comprehensive sports management system that connects athletes with coaches, built using Node.js and Express.js.

## 🌟 Features

### **For Athletes:**
- 🏃‍♂️ **Athlete Registration** - Complete profile with sports category and competition level
- 📊 **Profile Management** - Update personal information and sports details
- 🏅 **Level Tracking** - District, State, and National level management
- 📱 **Responsive Dashboard** - Modern, mobile-friendly interface

### **For Coaches:**
- 👨‍🏫 **Coach Registration** - Professional coach profiles with government ID verification
- 🎯 **Sports Expertise** - Specialized coaching in various sports categories
- 📈 **Athlete Management** - Track and mentor athletes
- 🔒 **Verified Credentials** - Government-issued sports ID validation

### **Platform Features:**
- 🔐 **Secure Authentication** - Separate login systems for athletes and coaches
- 🛡️ **Password Security** - Bcrypt hashing for password protection
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- ⚡ **Real-time Validation** - Client and server-side form validation
- 🎨 **Modern UI/UX** - Beautiful gradient designs with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   # For development (with auto-restart)
   npm run dev
   
   # Or for production
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
sports-athlete-platform/
├── public/                    # Static files
│   ├── index.html            # Main landing page
│   ├── athlete/              # Athlete pages
│   │   ├── login.html        # Athlete login
│   │   ├── signup.html       # Athlete registration
│   │   └── dashboard.html    # Athlete dashboard
│   └── coach/                # Coach pages
│       ├── login.html        # Coach login
│       ├── signup.html       # Coach registration
│       └── dashboard.html    # Coach dashboard
├── server.js                 # Main server file
├── athletes.json            # Athlete data storage
├── coaches.json             # Coach data storage
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🎯 User Registration Details

### **Athlete Registration Fields:**
- **Personal Info:** Name, Age (10-100), Gender, Email, Phone
- **Sports Info:** Sports Category, Competition Level (District/State/National)
- **Security:** Password with strength validation

### **Coach Registration Fields:**
- **Personal Info:** Name, Age (18-100), Gender, Email, Phone
- **Sports Info:** Sports Category, Government Sports ID
- **Security:** Password with strength validation

## 🔧 API Endpoints

### **Main Routes**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET    | `/` | Main landing page | No |
| GET    | `/athlete/login` | Athlete login page | No |
| GET    | `/athlete/signup` | Athlete registration page | No |
| GET    | `/athlete/dashboard` | Athlete dashboard | Yes |
| GET    | `/coach/login` | Coach login page | No |
| GET    | `/coach/signup` | Coach registration page | No |
| GET    | `/coach/dashboard` | Coach dashboard | Yes |

### **Authentication Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST   | `/athlete/login` | Athlete login | No |
| POST   | `/athlete/signup` | Athlete registration | No |
| POST   | `/coach/login` | Coach login | No |
| POST   | `/coach/signup` | Coach registration | No |
| POST   | `/logout` | Logout (both types) | No |

### **API Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET    | `/api/athlete` | Get athlete profile | Athlete |
| PUT    | `/api/athlete` | Update athlete profile | Athlete |
| GET    | `/api/coach` | Get coach profile | Coach |
| PUT    | `/api/coach` | Update coach profile | Coach |

## 🏅 Sports Categories

The platform supports the following sports categories:
- ⚽ Football
- 🏀 Basketball
- 🏏 Cricket
- 🎾 Tennis
- 🏸 Badminton
- 🏊 Swimming
- 🏃 Athletics
- 🏐 Volleyball
- 🏑 Hockey
- 🏓 Table Tennis
- ➕ Other

## 🔒 Security Features

- **Password Hashing:** All passwords are hashed using bcryptjs
- **Session Management:** Secure session configuration with proper timeouts
- **Input Validation:** Comprehensive server-side validation
- **Age Restrictions:** Athletes (10-100), Coaches (18-100)
- **Email Uniqueness:** Prevents duplicate registrations
- **Government ID Verification:** Coaches must provide valid sports government ID

## 🎨 UI/UX Features

- **Modern Design:** Gradient backgrounds and smooth animations
- **Responsive Layout:** Works on all device sizes
- **Real-time Feedback:** Password strength indicators and form validation
- **Loading States:** Visual feedback during API calls
- **Error Handling:** User-friendly error messages
- **Success Notifications:** Clear confirmation messages

## 🚀 Development

### **Available Scripts**
- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon

### **Environment Variables**
For production deployment, consider setting:
```bash
PORT=3000
SESSION_SECRET=your-super-secret-key
NODE_ENV=production
```

## 🔧 Customization

### **Adding New Sports Categories**
Edit the select options in:
- `public/athlete/signup.html`
- `public/coach/signup.html`
- `public/athlete/dashboard.html`
- `public/coach/dashboard.html`

### **Modifying User Fields**
Update the form fields and validation in:
- Server-side: `server.js` (validation and storage)
- Client-side: HTML forms and JavaScript validation

### **Database Integration**
Replace JSON file storage with:
- MongoDB
- PostgreSQL
- MySQL
- Any other database system

## 🚀 Production Deployment

### **Security Considerations**
1. **Change Session Secret:** Update the session secret in `server.js`
2. **Use HTTPS:** Enable SSL/TLS in production
3. **Database:** Replace JSON files with a proper database
4. **Environment Variables:** Use environment variables for sensitive data
5. **Rate Limiting:** Add rate limiting to prevent abuse

### **Deployment Options**
- **Heroku:** Easy deployment with git integration
- **DigitalOcean:** VPS deployment with Docker
- **AWS:** EC2 or Elastic Beanstalk
- **Vercel:** Serverless deployment

## 🐛 Troubleshooting

### **Common Issues**

1. **Port Already in Use**
   ```bash
   npx kill-port 3000
   ```

2. **Module Not Found**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Session Not Working**
   - Check if cookies are enabled in your browser
   - Verify session secret is set correctly

4. **Data Not Persisting**
   - Check file permissions for `athletes.json` and `coaches.json`
   - Ensure the server has write access to the directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the code comments for implementation details
3. Create an issue in the repository

## 🎯 Future Enhancements

- **Athlete-Coach Matching:** Connect athletes with suitable coaches
- **Progress Tracking:** Record and track athlete performance
- **Event Management:** Organize sports events and competitions
- **Payment Integration:** Handle coaching fees and payments
- **Mobile App:** Native mobile applications
- **Video Analysis:** Upload and analyze sports videos
- **Social Features:** Athlete and coach networking
- **Notification System:** Real-time updates and alerts

---

**Built with ❤️ for the sports community! 🏆**