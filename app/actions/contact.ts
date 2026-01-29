"use server"

export async function submitContactForm(formData: FormData) {
  const data = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    service: formData.get("service") as string,
    message: formData.get("message") as string,
    submittedAt: new Date().toISOString(),
  }

  try {
    // In a real application, you would:
    // 1. Save to database
    // 2. Send emails to both addresses
    // 3. Send confirmation email to user

    console.log("Contact form submission:", data)

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate saving to database (admin leads)
    // This would typically be saved to your database

    return {
      success: true,
      message: "Thank you for your message! We will get back to you within 24 hours.",
    }
  } catch (error) {
    console.error("Error submitting contact form:", error)
    return {
      success: false,
      message: "There was an error sending your message. Please try again.",
    }
  }
}
