import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { SessionUser } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { email, password, otp, loginType, institutionCode } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email or identifier is required." },
        { status: 400 }
      );
    }

    if (loginType === "OTP" || otp) {
      if (!otp) {
        return NextResponse.json(
          { success: false, error: "6-digit OTP is required." },
          { status: 400 }
        );
      }
      // Demo OTP standard verification (123456 or matching dynamic OTP)
      if (otp !== "123456") {
        return NextResponse.json(
          { success: false, error: "Invalid or expired OTP. Please use demo OTP: 123456." },
          { status: 401 }
        );
      }
    } else {
      if (!password) {
        return NextResponse.json(
          { success: false, error: "Password is required." },
          { status: 400 }
        );
      }
    }

    // Find institution if code provided, or search by email domain / lookup
    let institutionId: string | undefined;
    if (institutionCode) {
      const inst = await db.institution.findUnique({ where: { code: institutionCode } });
      if (!inst) {
        return NextResponse.json(
          { success: false, error: "Invalid institution code." },
          { status: 400 }
        );
      }
      institutionId = inst.id;
    }

    // Lookup user
    const user = await db.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        ...(institutionId ? { institutionId } : {}),
      },
      include: {
        institution: true,
        studentProfile: true,
        guardianAccount: {
          include: {
            guardianLinks: {
              where: { isVerified: true, canAccessPortal: true },
              include: { student: true },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid email or account is inactive." },
        { status: 401 }
      );
    }

    // Check password if standard login
    if (loginType !== "OTP" && !otp) {
      const isPwValid = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
      if (!isPwValid) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password." },
          { status: 401 }
        );
      }
    }

    let studentId: string | undefined;
    let guardianId: string | undefined;
    let activeChildId: string | undefined;

    if (user.role === "STUDENT") {
      if (!user.studentProfile) {
        return NextResponse.json(
          { success: false, error: "No student record associated with this account." },
          { status: 403 }
        );
      }
      studentId = user.studentProfile.id;
    } else if (user.role === "PARENT") {
      if (!user.guardianAccount) {
        return NextResponse.json(
          { success: false, error: "No guardian record associated with this account." },
          { status: 403 }
        );
      }
      guardianId = user.guardianAccount.id;
      // Default to first linked child
      if (user.guardianAccount.guardianLinks.length > 0) {
        activeChildId = user.guardianAccount.guardianLinks[0].studentId;
      }
    }

    const sessionUser: SessionUser = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName || user.name || "",
      role: (user.role as any) || "STUDENT",
      institutionId: user.institutionId || "",
      institutionName: user.institution?.name || "",
      studentId,
      guardianId,
      activeChildId,
    };

    const token = await signToken(sessionUser);

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      data: {
        user: sessionUser,
        token,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
