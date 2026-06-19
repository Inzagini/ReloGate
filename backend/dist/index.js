"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const profile_js_1 = require("./routes/profile.js");
const chat_js_1 = require("./routes/chat.js");
const payment_js_1 = require("./routes/payment.js");
const form_js_1 = require("./routes/form.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Routes
app.use('/', profile_js_1.profileRouter);
app.use('/', chat_js_1.chatRouter);
app.use('/', payment_js_1.paymentRouter);
app.use('/', form_js_1.formRouter);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'relocation-backend' });
});
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
