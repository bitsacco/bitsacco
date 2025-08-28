import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const API_URL = process.env.API_URL || "http://localhost:4000/v1";

/**
 * API Proxy handler to forward requests to the backend API
 * Integrates with NextAuth for authentication
 */
async function proxyHandler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: pathSegments } = await params;
    const path = pathSegments.join("/");
    const url = `${API_URL}/${path}${req.nextUrl.search}`;

    // Get the session to add auth headers
    const session = await auth();

    // Forward the request headers, excluding host
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "host") {
        headers.set(key, value);
      }
    });

    // Add authentication header if user is authenticated
    if (session?.user) {
      // In a real implementation, you'd get the token from session
      // For now, we forward any existing auth header
      const authHeader = req.headers.get("authorization");
      if (authHeader) {
        headers.set("authorization", authHeader);
      }
    }

    // Get the request body if it exists
    let body: BodyInit | null = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.text();
    }

    // Make the request to the backend API
    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
      // @ts-expect-error - duplex is needed for streaming but not in types
      duplex: "half",
    });

    // Create response with proper headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Skip some headers that shouldn't be forwarded
      if (
        !["content-encoding", "content-length", "transfer-encoding"].includes(
          key.toLowerCase(),
        )
      ) {
        responseHeaders.set(key, value);
      }
    });

    // Add CORS headers
    responseHeaders.set(
      "Access-Control-Allow-Origin",
      req.headers.get("origin") || "*",
    );
    responseHeaders.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    responseHeaders.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    responseHeaders.set("Access-Control-Allow-Credentials", "true");

    // Handle response
    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal proxy error" },
      { status: 500 },
    );
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const DELETE = proxyHandler;
export const PATCH = proxyHandler;
export const OPTIONS = proxyHandler;
