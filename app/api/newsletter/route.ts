import { NextRequest, NextResponse } from "next/server";

// Email validation function
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Check if Buttondown is configured
    if (!process.env.BUTTONDOWN_API_KEY) {
      console.log(`📧 Newsletter signup (Buttondown not configured): ${email}`);
      return NextResponse.json(
        { 
          message: "Newsletter signup received! We'll add you once our email service is ready.",
          email: email 
        },
        { status: 200 }
      );
    }

    // Subscribe to Buttondown
    try {
      const response = await fetch("https://api.buttondown.com/v1/subscribers", {
        method: "POST",
        headers: {
          "Authorization": `Token ${process.env.BUTTONDOWN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          metadata: {
            source: "website-footer",
            subscribed_at: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        return NextResponse.json(
          { 
            message: "🎉 Successfully subscribed! Welcome to EduVox newsletter.",
            email: email 
          },
          { status: 200 }
        );
      } else if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.email && errorData.email.includes("already exists")) {
          return NextResponse.json(
            { message: "You're already subscribed to our newsletter!" },
            { status: 200 }
          );
        }
        throw new Error(`Buttondown API error: ${JSON.stringify(errorData)}`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (buttondownError) {
      console.error("Buttondown subscription error:", buttondownError);
      return NextResponse.json(
        { 
          message: "Newsletter signup received! We'll add you once our email service is ready.",
          email: email 
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}