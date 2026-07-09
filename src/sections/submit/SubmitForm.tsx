import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../../components/Reveal'

interface DisputeForm {
  firstName: string
  lastName: string
  email: string
  street: string
  town: string
  postCode: string
  country: string
  incidentDate: string
  operator: string
  accountId: string
  amountClaimed: string
  details: string
  verifyTrue: boolean
  consentData: boolean
  acceptRules: boolean
}

const initialForm: DisputeForm = {
  firstName: '',
  lastName: '',
  email: '',
  street: '',
  town: '',
  postCode: '',
  country: '',
  incidentDate: '',
  operator: '',
  accountId: '',
  amountClaimed: '',
  details: '',
  verifyTrue: false,
  consentData: false,
  acceptRules: false,
}

type ErrorMap = Partial<Record<keyof DisputeForm, string>>

export default function SubmitForm() {
  const [form, setForm] = useState<DisputeForm>(initialForm)
  const [errors, setErrors] = useState<ErrorMap>({})
  const [submitted, setSubmitted] = useState(false)

  function validate(values: DisputeForm) {
    const next: ErrorMap = {}
    if (!values.firstName.trim()) next.firstName = 'First name is required.'
    if (!values.lastName.trim()) next.lastName = 'Last name is required.'
    if (!values.email.trim()) next.email = 'Complainant email is required.'
    if (!values.street.trim()) next.street = 'Street & house number is required.'
    if (!values.town.trim()) next.town = 'Town is required.'
    if (!values.postCode.trim()) next.postCode = 'Post code is required.'
    if (!values.country.trim()) next.country = 'Country of residence is required.'
    if (!values.incidentDate) next.incidentDate = 'Date of incident is required.'
    if (!values.operator.trim()) next.operator = 'Operator is required.'
    if (!values.amountClaimed.trim()) next.amountClaimed = 'Amount claimed is required.'
    if (!values.details.trim()) next.details = 'Please describe the details of the case.'
    if (!values.verifyTrue) next.verifyTrue = 'Required.'
    if (!values.consentData) next.consentData = 'Required.'
    if (!values.acceptRules) next.acceptRules = 'Required.'
    return next
  }

  function handleChange<K extends keyof DisputeForm>(key: K, value: DisputeForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      setSubmitted(true)
    }
  }

  return (
    <section className="bg-gray-50 pt-16 pb-16 sm:pt-20 sm:pb-20">
      <Reveal className="text-center max-w-2xl mx-auto px-4 mb-14">
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="h-px w-8 bg-gray-400" />
          <span className="text-xs font-semibold tracking-widest text-gray-500">
            GET IN TOUCH
          </span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold">
          <span className="text-navy-800">Submit a </span>
          <span className="text-gold-500 bg-gold-300/30 px-1">Dispute</span>
        </h2>
        <p className="mt-6 text-lg text-gold-600/80 leading-relaxed">
          Use the form below to submit a dispute, request information about
          our ADR services, or ask operator-side questions regarding ADR
          agreements. Curaçao Gaming Control Authority standards.
        </p>
      </Reveal>

      <Reveal delay={100} className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-12">
          {submitted ? (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold text-navy-800">Dispute Submitted</h3>
              <p className="mt-4 text-gray-600">
                Thank you, {form.firstName}. Your dispute has been received.
                Resolvo will acknowledge receipt within 7 calendar days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h3 className="text-gold-500 text-xl font-semibold">
                Resolvo Dispute Submission
              </h3>
              <p className="text-sm text-gray-500 mt-1 mb-8">
                Fields marked with <span className="text-red-500">*</span> are
                required.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="First Name" required error={errors.firstName}>
                  <input
                    type="text"
                    placeholder="First name as in ID document"
                    value={form.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={inputClass(!!errors.firstName)}
                  />
                </Field>
                <Field label="Last Name" required error={errors.lastName}>
                  <input
                    type="text"
                    placeholder="Last name as in ID document"
                    value={form.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={inputClass(!!errors.lastName)}
                  />
                </Field>

                <Field label="Complainant Email" required error={errors.email} full>
                  <input
                    type="email"
                    placeholder="Same email used at registration"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={inputClass(!!errors.email)}
                  />
                </Field>

                <Field label="Street & House Number/Name" required error={errors.street} full>
                  <input
                    type="text"
                    placeholder="e.g. Main Street 42"
                    value={form.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                    className={inputClass(!!errors.street)}
                  />
                </Field>

                <Field label="Town" required error={errors.town}>
                  <input
                    type="text"
                    value={form.town}
                    onChange={(e) => handleChange('town', e.target.value)}
                    className={inputClass(!!errors.town)}
                  />
                </Field>
                <Field label="Post Code" required error={errors.postCode}>
                  <input
                    type="text"
                    value={form.postCode}
                    onChange={(e) => handleChange('postCode', e.target.value)}
                    className={inputClass(!!errors.postCode)}
                  />
                </Field>

                <Field label="Country of Residence" required error={errors.country}>
                  <input
                    type="text"
                    placeholder="e.g. United States"
                    value={form.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className={inputClass(!!errors.country)}
                  />
                </Field>
                <Field label="Date of Incident" required error={errors.incidentDate}>
                  <input
                    type="date"
                    value={form.incidentDate}
                    onChange={(e) => handleChange('incidentDate', e.target.value)}
                    className={inputClass(!!errors.incidentDate)}
                  />
                </Field>

                <Field label="Operator" required error={errors.operator} full>
                  <input
                    type="text"
                    value={form.operator}
                    onChange={(e) => handleChange('operator', e.target.value)}
                    className={inputClass(!!errors.operator)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Only Curaçao registered operators working with Resolvo
                  </p>
                </Field>

                <Field label="Operator Reference / Account ID" error={errors.accountId}>
                  <input
                    type="text"
                    placeholder="Your account ID or reference"
                    value={form.accountId}
                    onChange={(e) => handleChange('accountId', e.target.value)}
                    className={inputClass(!!errors.accountId)}
                  />
                </Field>
                <Field label="Amount claimed (in EUR)" required error={errors.amountClaimed}>
                  <div className="flex">
                    <input
                      type="number"
                      value={form.amountClaimed}
                      onChange={(e) => handleChange('amountClaimed', e.target.value)}
                      className={`${inputClass(!!errors.amountClaimed)} rounded-r-none`}
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-sm text-gray-500">
                      EUR
                    </span>
                  </div>
                </Field>

                <Field label="Details of the Case" required error={errors.details} full>
                  <textarea
                    rows={5}
                    placeholder="Please provide a clear, detailed, and precise account of your version of the events in a single paragraph, including all relevant specifics such as exact amounts, dates, reference numbers, and any other critical details or supporting evidence available."
                    value={form.details}
                    onChange={(e) => handleChange('details', e.target.value)}
                    className={inputClass(!!errors.details)}
                  />
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    RESOLVO's decision will be based solely on the information
                    submitted by the parties; no independent investigation
                    will be conducted, and there is no obligation to request
                    further details. Any information or submissions provided
                    by the Complainant after the case has been opened will
                    generally not be considered, and follow-up emails will
                    not be responded to in the interest of efficient case
                    management.
                  </p>
                </Field>

                <Field label="Evidence (screenshots, images)" full>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/gif"
                    className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md bg-gray-50 py-2.5 px-3 file:mr-4 file:py-1.5 file:px-4 file:rounded file:border-0 file:bg-gray-200 file:text-sm file:font-medium file:text-navy-800 file:cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supported: jpg, png, gif. Max 5 MB per file, 10 MB total.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">No files selected yet</p>
                </Field>
              </div>

              <div className="mt-8 space-y-5">
                <Checkbox
                  checked={form.verifyTrue}
                  onChange={(v) => handleChange('verifyTrue', v)}
                  error={errors.verifyTrue}
                >
                  I verify that the information is accurate and true, and I
                  have not submitted this claim to any other ADR or Court.{' '}
                  <span className="text-red-500">*</span>
                </Checkbox>

                <Checkbox
                  checked={form.consentData}
                  onChange={(v) => handleChange('consentData', v)}
                  error={errors.consentData}
                >
                  I consent to Resolvo processing my personal data and
                  accessing relevant data from the operator / Curaçao Gaming
                  Control Board for this dispute. I accept the{' '}
                  <a href="#" className="text-blue-700 underline">
                    Resolvo Privacy Policy
                  </a>
                  . <span className="text-red-500">*</span>
                </Checkbox>

                <Checkbox
                  checked={form.acceptRules}
                  onChange={(v) => handleChange('acceptRules', v)}
                  error={errors.acceptRules}
                >
                  I have read, understood, and accept the{' '}
                  <Link to="/rules" className="text-blue-700 underline">
                    Resolvo Rules of Procedure
                  </Link>
                  . <span className="text-red-500">*</span>
                </Checkbox>
              </div>

              <button
                type="submit"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-800 px-6 py-3 font-semibold text-white hover:bg-blue-900 hover:-translate-y-1 transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
                </svg>
                Submit Complaint
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  )
}

function inputClass(hasError: boolean) {
  return `w-full rounded-md border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold-400 ${
    hasError ? 'border-red-500' : 'border-gray-300'
  }`
}

function Field({
  label,
  required,
  error,
  full,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  full?: boolean
  children: ReactNode
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-semibold text-navy-800 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function Checkbox({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1"
        />
        <span>{children}</span>
      </label>
      {error && <p className="mt-1 ml-7 text-xs text-red-600">{error}</p>}
    </div>
  )
}
