import { z } from "zod"

//login validation
export const loginSchema = z.object({
    email: z.string().email("Invalid email address."),
})

//registration validation
export const registrationSchema = z.object({
    name: z.string().min(4, "Username must be at least 4 characters."),
    email: z.string().email("Invalid email address."),
    // Corrected Phone Validation:
    phone: z.string()
        .min(10, "Phone number must be at least 10 digits.")
        .max(15, "Phone number cannot exceed 15 digits.")
        .regex(/^\d+$/, "Phone number must contain only digits.")
        .nonempty("Phone number is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().refine(val => val === form.getValues("password"), { // Fixed z.ref.password
        message: "Passwords don't match!",
        path: ["confirmPassword"]
    })
});

