"use client";

import { useActionState } from "react";
import { createInstitution, type InstitutionFormState } from "@/app/admin/(portal)/institutions/actions";

const initial: InstitutionFormState = { error: null, success: null };

export function CreateInstitutionForm() {
  const [state, action, pending] = useActionState(createInstitution, initial);
  return <details className="sa-card sa-form-disclosure"><summary>Create institution</summary><form className="sa-form-grid" action={action}>
    <label>Name<input name="name" required minLength={2} maxLength={160} /></label><label>Code<input name="code" maxLength={40} /></label><label>Slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} /></label>
    <label>Type<select name="type" defaultValue="SCHOOL"><option value="SCHOOL">School</option><option value="COLLEGE">College</option><option value="OTHER">Other</option></select></label><label>Contact email<input name="email" type="email" /></label><label>Phone<input name="phone" maxLength={40} /></label><label>Street address<input name="address" maxLength={300} /></label><label>City<input name="city" maxLength={100} /></label><label>State<input name="state" maxLength={100} /></label><label>Postal code<input name="postalCode" maxLength={20} /></label><label>Country<input name="country" defaultValue="India" required maxLength={80} /></label><label>Website<input name="website" type="url" /></label>
    {state.error && <p className="sa-form-message sa-form-error" role="alert">{state.error}</p>}{state.success && <p className="sa-form-message sa-form-success" role="status">{state.success}</p>}<button className="sa-button sa-button-primary" disabled={pending}>{pending ? "Saving…" : "Create institution"}</button>
  </form></details>;
}
