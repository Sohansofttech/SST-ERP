"use client";

import { useActionState } from "react";
import { editInstitution, type InstitutionFormState } from "@/app/admin/(portal)/institutions/actions";

const initial: InstitutionFormState = { error: null, success: null };
type InstitutionData = { id: string; name: string; code: string | null; slug: string; type: "SCHOOL" | "COLLEGE" | "OTHER"; email: string | null; phone: string | null; address: string | null; city: string | null; state: string | null; postalCode: string | null; country: string; website: string | null };

export function EditInstitutionForm({ institution }: { institution: InstitutionData }) {
  const [state, action, pending] = useActionState(editInstitution, initial);
  return <form className="sa-form-grid sa-card sa-form-card" action={action}>
    <input type="hidden" name="id" value={institution.id} />
    <label>Name<input name="name" defaultValue={institution.name} required minLength={2} maxLength={160} /></label><label>Code<input name="code" defaultValue={institution.code ?? ""} maxLength={40} /></label><label>Slug<input name="slug" defaultValue={institution.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} /></label>
    <label>Type<select name="type" defaultValue={institution.type}><option value="SCHOOL">School</option><option value="COLLEGE">College</option><option value="OTHER">Other</option></select></label><label>Contact email<input name="email" type="email" defaultValue={institution.email ?? ""} /></label><label>Phone<input name="phone" defaultValue={institution.phone ?? ""} maxLength={40} /></label><label>Street address<input name="address" defaultValue={institution.address ?? ""} maxLength={300} /></label><label>City<input name="city" defaultValue={institution.city ?? ""} maxLength={100} /></label><label>State<input name="state" defaultValue={institution.state ?? ""} maxLength={100} /></label><label>Postal code<input name="postalCode" defaultValue={institution.postalCode ?? ""} maxLength={20} /></label><label>Country<input name="country" defaultValue={institution.country} required maxLength={80} /></label><label>Website<input name="website" type="url" defaultValue={institution.website ?? ""} /></label>
    {state.error && <p className="sa-form-message sa-form-error" role="alert">{state.error}</p>}{state.success && <p className="sa-form-message sa-form-success" role="status">{state.success}</p>}<button className="sa-button sa-button-primary" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
  </form>;
}
