import { z } from "zod";

// ============================================================================
// USER & AUTH SCHEMAS
// ============================================================================

export const userRoleSchema = z.enum(["citizen", "official", "analyst"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    userName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    locationName: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const userProfileSchema = z.object({
    userName: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    role: userRoleSchema,
});
export type UserProfile = z.infer<typeof userProfileSchema>;

export const loginResponseSchema = z.object({
    token: z.string(),
    userName: z.string(),
    role: z.string()
});
export type LoginResponseSchema = z.infer<typeof loginResponseSchema>

export const authTokenResponseSchema = z.object({
    token: z.string(),
    user: z.object({
        userId: z.number(),
        userName: z.string(),
        email: z.string(),
        role: userRoleSchema,
    }),
});
export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>;

// ============================================================================
// HAZARD & REPORT SCHEMAS
// ============================================================================

export const hazardTypeSchema = z.object({
    typeId: z.number(),
    typeName: z.string(),
});
export type HazardType = z.infer<typeof hazardTypeSchema>;

export const reportStatusSchema = z.enum([
    "not_verified",
    "community_verified",
    "officially_verified",
    "debunked",
]);
export type ReportStatus = z.infer<typeof reportStatusSchema>;

export const sentimentSchema = z.enum(["positive", "neutral", "negative", "urgent"]);
export type Sentiment = z.infer<typeof sentimentSchema>;

export const createReportSchema = z.object({
    text: z.string().optional(),
    typeId: z.number(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    locationName: z.string().optional(),
    media: z.array(z.instanceof(File)).optional(),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;

export const hazardReportSchema = z.object({
    reportId: z.number(),
    userId: z.number().optional(),
    userName: z.string().optional(),
    hazardTypeId: z.number(),
    hazardTypeName: z.string().optional(),
    description: z.string().optional(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }),
    locationName: z.string().optional(),
    sentimentId: z.number().optional(),
    sentimentName: z.string().optional(),
    relevanceScore: z.number().optional(),
    reportTime: z.string(),
    mediaUrls: z.array(z.string()).optional(),
    status: reportStatusSchema,
    verifiedBy: z.number().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
});
export type HazardReport = z.infer<typeof hazardReportSchema>;

// ============================================================================
// HOTSPOT SCHEMAS
// ============================================================================

export const hotspotSchema = z.object({
    hotspotId: z.number(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }),
    radiusKm: z.number(),
    intensityScore: z.number(),
    dominantHazardTypeId: z.number().optional(),
    dominantHazardTypeName: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
});
export type Hotspot = z.infer<typeof hotspotSchema>;

// ============================================================================
// SOCIAL MEDIA SCHEMAS
// ============================================================================

export const socialMediaPlatformSchema = z.enum([
    "twitter",
    "reddit",
    "youtube",
    "facebook",
]);
export type SocialMediaPlatform = z.infer<typeof socialMediaPlatformSchema>;

export const socialMediaPostSchema = z.object({
    postId: z.number(),
    platformId: z.number(),
    platformName: z.string().optional(),
    authorName: z.string().optional(),
    content: z.string(),
    locationName: z.string().optional(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }).optional(),
    status: reportStatusSchema.optional(),
    verifiedBy: z.number().optional(),
    hazardTypeId: z.number().optional(),
    hazardTypeName: z.string().optional(),
    mediaUrls: z.array(z.string()).optional(),
    postTime: z.string(),
    sentimentId: z.number().optional(),
    sentimentName: z.string().optional(),
    relevanceScore: z.number().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
});
export type SocialMediaPost = z.infer<typeof socialMediaPostSchema>;

// ============================================================================
// OFFLINE QUEUE SCHEMAS
// ============================================================================

export const offlineReportSchema = z.object({
    id: z.string(),
    text: z.string().optional(),
    typeId: z.number(),
    latitude: z.number(),
    longitude: z.number(),
    locationName: z.string().optional(),
    mediaFiles: z.array(z.object({
        name: z.string(),
        type: z.string(),
        size: z.number(),
        dataUrl: z.string(),
    })).optional(),
    createdAt: z.string(),
    syncStatus: z.enum(["pending", "syncing", "failed"]),
    retryCount: z.number(),
});
export type OfflineReport = z.infer<typeof offlineReportSchema>;
