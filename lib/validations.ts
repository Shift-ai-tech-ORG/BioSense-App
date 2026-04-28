import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  ageVerified: z.literal(true, 'You must confirm you are 18 or over'),
  tcAccepted: z.literal(true, 'You must accept the Terms & Conditions'),
  privacyAccepted: z.literal(true, 'You must accept the Privacy Policy'),
  dataConsentAccepted: z.literal(true, 'You must consent to data processing'),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const onboardingStep1Schema = z.object({
  goalType: z.enum(['PERFORMANCE', 'HEALTH', 'BODY_COMP', 'WELLBEING']),
})

export const onboardingStep2Schema = z.object({
  goalText: z.string().min(5, 'Please describe your goal in a few words'),
  goalDeadline: z.string().optional(),
})

export const onboardingStep3Schema = z.object({
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  lifestyle: z.string().optional(),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
