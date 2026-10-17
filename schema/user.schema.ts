import z, { email } from "zod";

export const userRegistrationSchema = z.object({
  email: z.email("The email is required."),
  name: z.string("Your name is required."),
  pswd: z.string("A password is required.").min(8),
  confirmpswd: z.string("The confirmation of the password is required").min(8)
})

export type userRegistrationType = z.infer<typeof userRegistrationSchema>

export const connexionSchema = z.object({
  email: z.email("The email is required"),
  pswd: z.string("The password is required.").min(8)
})

export type connexionType = z.infer<typeof connexionSchema>

export const codeSchema = z.coerce.number("Le code doit être un numéro de 6 chiffres.").min(100000).max(999999)

export const clientInformationsSchema = z.object({
  email: z.email("The email is required.").optional(),
  name: z.string("Your name is required.").optional(),
  //d'autres champs à rajouter concernant un client
})

export type clientInfoType = z.infer<typeof clientInformationsSchema>

export const filterSchema = z.object({
  name: z.string().optional(),
  activate: z.boolean().optional(),
  createdAt: z.date().optional()
  //des filtres à rajouter
})

export type filterType = z.infer<typeof filterSchema>
