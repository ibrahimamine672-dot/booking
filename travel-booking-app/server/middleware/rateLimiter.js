const rateLimit = require("express-rate-limit");

// General API rate limiter — 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,     // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,      // Disable the `X-RateLimit-*` headers
  message: {
    message: "Too many requests, please try again later.",
  },
});

// Stricter limiter for auth routes — 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login/register attempts, please try again later.",
  },
});

// Stricter limiter for AI chat — 20 requests per minute per IP (OpenAI costs money)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many AI requests, please slow down.",
  },
});

// Limiter for payment routes — 5 requests per minute per IP
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many payment attempts, please try again later.",
  },
});

// Limiter for FAQ / contact form — 5 requests per 15 minutes per IP (prevents email spam)
const faqLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many contact submissions, please try again later.",
  },
});

module.exports = { apiLimiter, authLimiter, aiLimiter, paymentLimiter, faqLimiter };
