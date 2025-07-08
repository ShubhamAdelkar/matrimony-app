import { z } from "zod"

//login validation
export const loginSchema = z.object({
    email: z.string().email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters"),

})

//registration validation
export const registrationSchema = z.object({
    name: z.string().min(4, "Name must be at least 4 characters.").nonempty("Name is required."),
    phone: z.string()
        .min(10, "Phone number must be at least 10 digits.")
        .max(15, "Phone number cannot exceed 15 digits.")
        .regex(/^\d+$/, "Phone number must contain only digits.")
        .nonempty("Phone number is required."),
    gender: z.enum(["Male", "Female"], { // <-- Remove .nonempty() here
        errorMap: (issue, ctx) => {
            if (issue.code === z.ZodIssueCode.invalid_enum_value) {
                return { message: "Please select your gender." };
            }
            return { message: ctx.defaultError };
        },
    }), // No .nonempty() needed
    email: z.string().email("Invalid email address.").nonempty("Email is required."),
    password: z.string().min(8, "Password must be at least 8 characters.").nonempty("Password is required."),
    confirmPassword: z.string().nonempty("Confirm password is required."),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match!",
    path: ["confirmPassword"],
});

