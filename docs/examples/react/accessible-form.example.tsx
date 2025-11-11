/**
 * Accessible Form Component Example
 *
 * Demonstrates WCAG 2.2 AA+ compliance with:
 * - Semantic HTML and ARIA labels
 * - Keyboard navigation support
 * - Error handling and validation
 * - Screen reader compatibility
 *
 * Standards: WCAG 2.2 AA (UX-01 to UX-05)
 */

import { useState, type FormEvent } from 'react';

// ============================================================================
// TYPES
// ============================================================================

type BillProposal = {
  title: string;
  description: string;
  category: 'environment' | 'healthcare' | 'education' | 'economy' | 'justice';
};

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  form?: string;
}

// ============================================================================
// ACCESSIBLE FORM COMPONENT
// ============================================================================

export function BillProposalForm() {
  const [formData, setFormData] = useState<BillProposal>({
    title: '',
    description: '',
    category: 'environment',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      // Validate form data
      const validated = BillProposalSchema.parse(formData);

      // Submit to API
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(validated),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrors({ form: error.message || 'Failed to submit bill' });
        return;
      }

      // Success
      setSubmitSuccess(true);
      setFormData({ title: '', description: '', category: 'environment' });

      // Announce success to screen readers
      const announcement = document.getElementById('form-status');
      if (announcement) {
        announcement.textContent = 'Bill proposal submitted successfully';
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to form errors
        const fieldErrors: FormErrors = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof FormErrors;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ form: 'An unexpected error occurred' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby="form-heading"
      noValidate // Use custom validation
    >
      {/* Heading */}
      <h2 id="form-heading">Propose New Bill</h2>

      {/* Live region for status announcements */}
      <output id="form-status" aria-live="polite" className="sr-only" />

      {/* Global form error */}
      {errors.form && (
        <output className="error-banner" aria-describedby="global-error">
          <span id="global-error">{errors.form}</span>
        </output>
      )}

      {/* Success message */}
      {submitSuccess && (
        <output className="success-banner" aria-live="polite">
          Bill proposal submitted successfully!
        </output>
      )}

      {/* Title field */}
      <div className="form-group">
        <label htmlFor="bill-title">
          Bill Title
          <span className="required">*</span>
        </label>

        <input
          id="bill-title"
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error title-hint' : 'title-hint'}
          disabled={isSubmitting}
          autoComplete="off"
        />

        <div id="title-hint" className="hint-text">
          5-500 characters. Be clear and descriptive.
        </div>

        {errors.title && (
          <div id="title-error" role="alert" className="error-text">
            <span className="error-icon" aria-hidden="true">
              ⚠
            </span>
            {errors.title}
          </div>
        )}
      </div>

      {/* Description field */}
      <div className="form-group">
        <label htmlFor="bill-description">
          Bill Description
          <span className="required">*</span>
        </label>

        <textarea
          id="bill-description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          rows={10}
          aria-required="true"
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? 'description-error description-hint' : 'description-hint'
          }
          disabled={isSubmitting}
        />

        <div id="description-hint" className="hint-text">
          Provide a detailed explanation of the bill's purpose and provisions. Minimum 10
          characters.
        </div>

        {errors.description && (
          <div id="description-error" role="alert" className="error-text">
            <span className="error-icon" aria-hidden="true">
              ⚠
            </span>
            {errors.description}
          </div>
        )}
      </div>

      {/* Category field */}
      <div className="form-group">
        <label htmlFor="bill-category">
          Category
          <span className="required">*</span>
        </label>

        <select
          id="bill-category"
          value={formData.category}
          onChange={e =>
            setFormData({
              ...formData,
              category: e.target.value as BillProposal['category'],
            })
          }
          aria-required="true"
          aria-invalid={!!errors.category}
          aria-describedby={errors.category ? 'category-error' : undefined}
          disabled={isSubmitting}
        >
          <option value="environment">Environment</option>
          <option value="healthcare">Healthcare</option>
          <option value="education">Education</option>
          <option value="economy">Economy</option>
          <option value="justice">Justice</option>
        </select>

        {errors.category && (
          <div id="category-error" role="alert" className="error-text">
            <span className="error-icon" aria-hidden="true">
              ⚠
            </span>
            {errors.category}
          </div>
        )}
      </div>

      {/* Submit button */}
      <div className="form-actions">
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
        </button>

        <button
          type="button"
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              category: 'environment',
            });
            setErrors({});
            setSubmitSuccess(false);
          }}
          disabled={isSubmitting}
          className="btn btn-secondary"
        >
          Clear Form
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// ACCESSIBLE STYLES (CSS-in-JS or separate stylesheet)
// ============================================================================

/*
// Ensure sufficient color contrast (WCAG 2.2 AA requirement)
.error-text {
  color: #d32f2f; // Contrast ratio 4.5:1 on white background
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.error-banner {
  background-color: #ffebee;
  border: 2px solid #d32f2f;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.success-banner {
  background-color: #e8f5e9;
  border: 2px solid #4caf50;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.required {
  color: #d32f2f;
  margin-left: 0.25rem;
}

.hint-text {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// Focus indicators (WCAG 2.2 requirement)
input:focus,
textarea:focus,
select:focus,
button:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

// Touch targets minimum 44x44px (WCAG 2.2 AA)
button,
input,
select,
textarea {
  min-height: 44px;
}

// Respect prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
*/

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
import { BillProposalForm } from './accessible-form.example';

function App() {
  return (
    <main>
      <h1>Legislative Proposals</h1>
      <BillProposalForm />
    </main>
  );
}
*/
