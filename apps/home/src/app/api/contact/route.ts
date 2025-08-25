import { type NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Simple in-memory rate limiting (consider Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 3 // Max 3 emails per hour per IP

function getRateLimitKey(req: NextRequest): string {
  // Get IP address from various headers
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown'
  return ip
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(key)

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (limit.count >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }

  limit.count++
  return false
}

// Email regex for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    // Initialize Resend with API key
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 },
      )
    }
    const resend = new Resend(resendApiKey)

    // Check rate limit
    const rateLimitKey = getRateLimitKey(req)
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const body = await req.json()
    const { name, email, subject, message, honeypot } = body

    // Check honeypot field (should be empty)
    if (honeypot) {
      // Bot detected, return success to fool the bot
      return NextResponse.json(
        { message: 'Email sent successfully' },
        { status: 200 },
      )
    }

    // Validate the input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 },
      )
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 },
      )
    }

    // Additional validation
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 })
    }

    // HTML escape function to prevent XSS
    const escapeHtml = (text: string): string => {
      const htmlEscapes: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
      }
      return text.replace(/[&<>"'\/]/g, (match) => htmlEscapes[match])
    }

    const supportEmail = process.env.SUPPORT_EMAIL || ''

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Bitsacco Contact Form <noreply@bitsacco.com>',
      to: [supportEmail],
      subject: `Contact Form: ${subject.replace(/[\r\n]/g, '')}`, // Remove line breaks to prevent header injection
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>This email was sent from the Bitsacco website contact form.</em></p>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        
        Message:
        ${message}
        
        ---
        This email was sent from the Bitsacco website contact form.
      `,
      replyTo: email,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 },
      )
    }

    console.log('Email sent successfully:', data)

    return NextResponse.json(
      { message: 'Email sent successfully', id: data?.id },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
