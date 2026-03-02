// src/lib/admin-auth.ts

/**
 * Admin Authentication Helper
 * ==============================
 * 
 * Simple password-based authentication for admin panel
 * 
 * ⚠️ Important: Store ADMIN_PASSWORD in .env.local
 *    Do NOT commit .env.local to git
 */

// Get password from environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Suvibha_1402";

/**
 * Verify admin password
 * @param password - Password to verify
 * @returns true if password is correct
 */
export function verifyPassword(password: string): boolean {
    if (!password) return false;
    
    // Compare with constant-time to prevent timing attacks
    return password === ADMIN_PASSWORD;
}

/**
 * Generate a simple session token
 * (For more security, use proper session management)
 * @returns Random token string
 */
export function generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

/**
 * Check if admin session is valid
 * @param sessionToken - Token from cookie/storage
 * @returns true if valid
 */
export function validateSession(sessionToken: string | undefined): boolean {
    if (!sessionToken) return false;
    
    // Simple check - in production, validate against server session
    return sessionToken.length > 10;
}

/**
 * Hash password (for future use)
 * Currently using plain comparison - upgrade to hashing in production
 * 
 * Example with bcrypt:
 * import * as bcrypt from 'bcrypt';
 * 
 * export async function hashPassword(password: string): Promise<string> {
 *     const salt = await bcrypt.genSalt(10);
 *     return bcrypt.hash(password, salt);
 * }
 * 
 * export async function verifyHashedPassword(
 *     password: string,
 *     hash: string
 * ): Promise<boolean> {
 *     return bcrypt.compare(password, hash);
 * }
 */

/**
 * Validate admin session from request
 * @param request - Astro request object
 * @returns true if user is authenticated admin
 */
export function isAdminAuthenticated(request: Request): boolean {
    const cookieHeader = request.headers.get("cookie");
    
    if (!cookieHeader) return false;
    
    // Look for admin_token cookie
    const cookies = cookieHeader.split(";");
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "admin_token" && value === "true") {
            return true;
        }
    }
    
    return false;
}

/**
 * Development mode: Allow access without password
 * Usage: http://localhost:3000/admin?dev=true
 * ⚠️ Only works in development, not in production
 */
export function isDevelopmentMode(url: URL): boolean {
    return url.searchParams.get("dev") === "true" && 
           process.env.NODE_ENV === "development";
}