"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = require("express");
exports.paymentRouter = (0, express_1.Router)();
exports.paymentRouter.post('/api/payment/verify', (req, res) => {
    const { txHash } = req.body;
    console.log(`[Payment Route] Mock verification request received for txHash: ${txHash || 'simulated_payment'}`);
    // Instantly return success and a mock token as per the reduced hackathon scope.
    // This ensures the demo is 100% reliable and fast.
    setTimeout(() => {
        res.json({
            success: true,
            paymentToken: `MOCK_TOKEN_${Date.now()}`,
            message: 'USDC Payment verified successfully (Mocked).'
        });
    }, 800); // 800ms delay to make the transaction spinner look natural in UI
});
