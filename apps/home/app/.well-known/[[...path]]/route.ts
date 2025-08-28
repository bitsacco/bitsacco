import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const apiUrl = process.env.API_URL

  if (!apiUrl) {
    console.error('API_URL is not configured')
    return NextResponse.json(
      { error: 'Proxy service is not configured' },
      { status: 500 },
    )
  }

  const path = params.path?.join('/') || ''
  const targetUrl = new URL(`/.well-known/${path}`, apiUrl)

  const searchParams = request.nextUrl.searchParams.toString()
  if (searchParams) {
    targetUrl.search = searchParams
  }

  try {
    const headers = new Headers()

    const forwardHeaders = ['accept', 'accept-language', 'user-agent']
    forwardHeaders.forEach((header) => {
      const value = request.headers.get(header)
      if (value) {
        headers.set(header, value)
      }
    })

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers,
    })

    const contentType = response.headers.get('content-type')
    const responseHeaders = new Headers()

    if (contentType) {
      responseHeaders.set('content-type', contentType)
    }

    responseHeaders.set(
      'cache-control',
      response.headers.get('cache-control') || 'public, max-age=3600',
    )

    if (!response.ok) {
      return new NextResponse(await response.text(), {
        status: response.status,
        headers: responseHeaders,
      })
    }

    const data = await response.arrayBuffer()

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 502 },
    )
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const apiUrl = process.env.API_URL

  if (!apiUrl) {
    return new NextResponse(null, { status: 500 })
  }

  const path = params.path?.join('/') || ''
  const targetUrl = new URL(`/.well-known/${path}`, apiUrl)

  const searchParams = request.nextUrl.searchParams.toString()
  if (searchParams) {
    targetUrl.search = searchParams
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      method: 'HEAD',
    })

    const responseHeaders = new Headers()
    const contentType = response.headers.get('content-type')

    if (contentType) {
      responseHeaders.set('content-type', contentType)
    }

    responseHeaders.set(
      'cache-control',
      response.headers.get('cache-control') || 'public, max-age=3600',
    )

    return new NextResponse(null, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Proxy HEAD error:', error)
    return new NextResponse(null, { status: 502 })
  }
}
