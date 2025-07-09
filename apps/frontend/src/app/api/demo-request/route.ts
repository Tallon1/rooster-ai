// apps/frontend/src/app/api/demo-request/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const demoRequestSchema = z.object({
  companyName: z.string().min(2),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  employeeCount: z.string(),
  userCount: z.string(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = demoRequestSchema.parse(body);

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Add to CRM system

    // For now, we'll just log the request
    console.log("Demo request received:", validatedData);

    // In production, integrate with AWS SES to send email
    // await sendDemoRequestEmail(validatedData);

    return NextResponse.json({
      success: true,
      message: "Demo request submitted successfully",
    });
  } catch (error) {
    console.error("Demo request error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid form data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
