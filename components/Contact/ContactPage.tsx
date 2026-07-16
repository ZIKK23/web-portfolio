'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    emailjs: {
      init: (publicKey: string) => void;
      sendForm: (serviceId: string, templateId: string, form: HTMLFormElement) => Promise<unknown>;
    };
  }
}

const MIN_MESSAGE_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 2000;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  return /^\(\d{3}\) \d{3}-\d{4}$/.test(phone);
}

export default function ContactPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const form = root.querySelector<HTMLFormElement>('#contact-form');
    const nameField = root.querySelector<HTMLInputElement>('#name');
    const emailField = root.querySelector<HTMLInputElement>('#email');
    const phoneField = root.querySelector<HTMLInputElement>('#phone');
    const messageField = root.querySelector<HTMLTextAreaElement>('#message');
    const fromField = root.querySelector<HTMLInputElement>('#from_field');
    const messageCounter = root.querySelector<HTMLElement>('#message-counter');
    const formMessages = root.querySelector<HTMLElement>('#form-messages');

    function getField(fieldId: string) {
      return root!.querySelector<HTMLInputElement | HTMLTextAreaElement>('#' + fieldId);
    }

    function getErrorDiv(fieldId: string) {
      return root!.querySelector<HTMLElement>('#' + fieldId + '-error');
    }

    function showError(fieldId: string, message: string) {
      const field = getField(fieldId);
      const errorDiv = getErrorDiv(fieldId);
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
      }
      field?.classList.add('error-field');
      field?.classList.remove('success-field');
      field?.setAttribute('aria-invalid', 'true');
    }

    function clearError(fieldId: string) {
      const errorDiv = getErrorDiv(fieldId);
      if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
      }
      const field = getField(fieldId);
      field?.classList.remove('error-field');
      field?.setAttribute('aria-invalid', 'false');
    }

    function showSuccess(fieldId: string) {
      const field = getField(fieldId);
      field?.classList.add('success-field');
      field?.classList.remove('error-field');
      field?.setAttribute('aria-invalid', 'false');
    }

    function clearErrorMessages() {
      root!.querySelectorAll<HTMLElement>('.error-message').forEach((message) => {
        message.textContent = '';
        message.style.display = 'none';
      });
      root!.querySelectorAll<HTMLElement>('.error-field').forEach((field) => {
        field.classList.remove('error-field');
        field.setAttribute('aria-invalid', 'false');
      });
    }

    function resetFieldStates() {
      root!.querySelectorAll<HTMLElement>('input, textarea').forEach((field) => {
        field.classList.remove('error-field', 'success-field');
        field.setAttribute('aria-invalid', 'false');
      });
    }

    function focusFirstErrorField() {
      root!.querySelector<HTMLElement>('.error-field')?.focus();
    }

    function showFormMessage(message: string, type: string) {
      if (!formMessages) return;
      formMessages.textContent = message;
      formMessages.className = 'form-messages ' + type;
      formMessages.style.display = 'block';
      formMessages.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function clearFormMessages() {
      if (!formMessages) return;
      formMessages.style.display = 'none';
      formMessages.className = 'form-messages';
    }

    function setButtonLoading(button: HTMLButtonElement, isLoading: boolean) {
      const textEl = button.querySelector<HTMLElement>('.button-text');
      if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        if (textEl) textEl.textContent = 'Sending...';
      } else {
        button.disabled = false;
        button.classList.remove('loading');
        if (textEl) textEl.textContent = 'Send Message';
      }
    }

    function updateMessageCounter() {
      if (!messageField || !messageCounter) return;
      const currentLength = messageField.value.length;

      messageCounter.textContent = `${currentLength}/${MIN_MESSAGE_LENGTH}`;
      messageCounter.classList.remove('warning', 'valid');
      if (currentLength >= MIN_MESSAGE_LENGTH) {
        messageCounter.classList.add('valid');
        messageCounter.textContent = `${currentLength}/${MAX_MESSAGE_LENGTH}`;
      } else if (currentLength > MIN_MESSAGE_LENGTH * 0.8) {
        messageCounter.classList.add('warning');
      }
    }

    function adjustTextareaHeight() {
      if (!messageField) return;
      const viewportHeight = window.innerHeight;
      let minHeight, maxHeight, height;

      if (window.innerWidth <= 768) {
        minHeight = Math.max(120, Math.floor(viewportHeight * 0.25) - 80);
        maxHeight = Math.max(180, Math.floor(viewportHeight * 0.35) - 80);
        height = Math.max(150, Math.floor(viewportHeight * 0.3) - 80);
      } else if (viewportHeight <= 600) {
        minHeight = 120;
        maxHeight = 180;
        height = 150;
      } else {
        minHeight = Math.floor(viewportHeight * 0.3) - 100;
        maxHeight = Math.floor(viewportHeight * 0.4) - 100;
        height = Math.floor(viewportHeight * 0.35) - 100;
      }

      messageField.style.minHeight = minHeight + 'px';
      messageField.style.maxHeight = maxHeight + 'px';
      messageField.style.height = height + 'px';
    }

    function sendEmail(event: SubmitEvent) {
      event.preventDefault();
      if (!form || !nameField || !emailField || !phoneField || !messageField || !fromField) return;

      const name = nameField.value.trim();
      const email = emailField.value.trim();
      const phone = phoneField.value.trim();
      const message = messageField.value.trim();

      clearErrorMessages();
      clearFormMessages();

      let hasErrors = false;

      if (!name) {
        hasErrors = true;
        showError('name', 'Full name is required');
      } else if (name.length < 2) {
        hasErrors = true;
        showError('name', 'Name must be at least 2 characters long');
      }

      if (!email) {
        hasErrors = true;
        showError('email', 'Email address is required');
      } else if (!isValidEmail(email)) {
        hasErrors = true;
        showError('email', 'Please enter a valid email address');
      }

      if (phone && !isValidPhone(phone)) {
        hasErrors = true;
        showError('phone', 'Please enter a valid phone number in format: (555) 123-4567');
      }

      if (!message) {
        hasErrors = true;
        showError('message', 'Message is required');
      } else if (message.length < MIN_MESSAGE_LENGTH) {
        hasErrors = true;
        showError('message', `Message must be at least ${MIN_MESSAGE_LENGTH} characters long. ${MIN_MESSAGE_LENGTH - message.length} characters remaining.`);
      } else if (message.length > MAX_MESSAGE_LENGTH) {
        hasErrors = true;
        showError('message', `Message is too long. Please reduce by ${message.length - MAX_MESSAGE_LENGTH} characters.`);
      }

      if (hasErrors) {
        focusFirstErrorField();
        showFormMessage('Please correct the errors below and try again.', 'error');
        return;
      }

      fromField.value = `${name} <${email}>`;

      const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (!submitButton) return;
      setButtonLoading(submitButton, true);

      window.emailjs
        .sendForm('service_48b6ao1', 'template_rn6shkd', form)
        .then(
          () => {
            showFormMessage("Thank you! Your message has been sent successfully. I'll get back to you soon.", 'success');
            form.reset();
            clearErrorMessages();
            updateMessageCounter();
            resetFieldStates();
          },
          (error: unknown) => {
            console.error('EmailJS Error:', error);
            showFormMessage('Sorry, there was a problem sending your message. Please try again or contact me directly.', 'error');
          }
        )
        .finally(() => setButtonLoading(submitButton, false));
    }

    form?.addEventListener('submit', sendEmail as unknown as EventListener);

    // Real-time validation.
    const onNameBlur = () => {
      const name = nameField!.value.trim();
      clearError('name');
      if (name && name.length >= 2) showSuccess('name');
      else if (name && name.length < 2) showError('name', 'Name must be at least 2 characters long');
    };
    const onNameInput = () => { if (nameField!.classList.contains('error-field')) clearError('name'); };
    nameField?.addEventListener('blur', onNameBlur);
    nameField?.addEventListener('input', onNameInput);

    const onEmailBlur = () => {
      const email = emailField!.value.trim();
      clearError('email');
      if (email && isValidEmail(email)) showSuccess('email');
      else if (email && !isValidEmail(email)) showError('email', 'Please enter a valid email address');
    };
    const onEmailInput = () => { if (emailField!.classList.contains('error-field')) clearError('email'); };
    emailField?.addEventListener('blur', onEmailBlur);
    emailField?.addEventListener('input', onEmailInput);

    const onPhoneBlur = () => {
      const phone = phoneField!.value.trim();
      clearError('phone');
      if (phone && isValidPhone(phone)) showSuccess('phone');
      else if (phone && !isValidPhone(phone)) showError('phone', 'Please enter a valid phone number in format: (555) 123-4567');
    };
    phoneField?.addEventListener('blur', onPhoneBlur);

    const onMessageInput = () => {
      updateMessageCounter();
      if (messageField!.classList.contains('error-field')) clearError('message');
    };
    const onMessageBlur = () => {
      const message = messageField!.value.trim();
      clearError('message');
      if (message && message.length >= MIN_MESSAGE_LENGTH) showSuccess('message');
      else if (message && message.length < MIN_MESSAGE_LENGTH) {
        showError('message', `Message must be at least ${MIN_MESSAGE_LENGTH} characters long. ${MIN_MESSAGE_LENGTH - message.length} characters remaining.`);
      }
    };
    messageField?.addEventListener('input', onMessageInput);
    messageField?.addEventListener('blur', onMessageBlur);

    const onPhoneFormatInput = () => {
      if (!phoneField) return;
      const digits = phoneField.value.replace(/\D/g, '').substring(0, 10);
      let formatted = '';
      if (digits.length > 0) formatted = '(' + digits.substring(0, 3);
      if (digits.length >= 4) formatted += ') ' + digits.substring(3, 6);
      if (digits.length >= 7) formatted += '-' + digits.substring(6, 10);
      phoneField.value = formatted;
    };
    phoneField?.addEventListener('input', onPhoneFormatInput);

    adjustTextareaHeight();
    updateMessageCounter();
    window.addEventListener('resize', adjustTextareaHeight);

    const clearOnInputHandlers: Array<[HTMLElement, EventListener]> = [];
    root.querySelectorAll<HTMLElement>('input, textarea').forEach((input) => {
      const handler = () => clearFormMessages();
      input.addEventListener('input', handler);
      clearOnInputHandlers.push([input, handler]);
    });

    return () => {
      form?.removeEventListener('submit', sendEmail as unknown as EventListener);
      nameField?.removeEventListener('blur', onNameBlur);
      nameField?.removeEventListener('input', onNameInput);
      emailField?.removeEventListener('blur', onEmailBlur);
      emailField?.removeEventListener('input', onEmailInput);
      phoneField?.removeEventListener('blur', onPhoneBlur);
      phoneField?.removeEventListener('input', onPhoneFormatInput);
      messageField?.removeEventListener('input', onMessageInput);
      messageField?.removeEventListener('blur', onMessageBlur);
      window.removeEventListener('resize', adjustTextareaHeight);
      clearOnInputHandlers.forEach(([el, handler]) => el.removeEventListener('input', handler));
    };
  }, []);

  return (
    <div ref={rootRef}>
      <Script
        src="https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"
        strategy="afterInteractive"
        onLoad={() => window.emailjs.init('wkDWKazXq616KcvRf')}
      />

      <header className="page-header container">
        <h1>Let&apos;s Connect!</h1>
      </header>

      <main className="container">
        <div id="form-messages" className="form-messages" role="alert" aria-live="polite" aria-atomic="true"></div>

        <form id="contact-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">
              Full Name <span className="required" aria-label="required">*</span>
            </label>
            <input type="text" id="name" name="name" required aria-describedby="name-hint name-error" autoComplete="name" />
            <div id="name-hint" className="field-hint">Enter your first and last name</div>
            <div id="name-error" className="error-message" role="alert" aria-live="polite"></div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email Address <span className="required" aria-label="required">*</span>
            </label>
            <input type="email" id="email" name="email" required aria-describedby="email-hint email-error" autoComplete="email" />
            <div id="email-hint" className="field-hint">I&apos;ll use this to respond to your message</div>
            <div id="email-error" className="error-message" role="alert" aria-live="polite"></div>
          </div>

          <input type="hidden" id="from_field" name="from_field" />

          <div className="form-group">
            <label htmlFor="phone">
              Phone Number <span className="optional">(optional)</span>
            </label>
            <input type="tel" id="phone" name="phone" pattern="\(\d{3}\) \d{3}-\d{4}" aria-describedby="phone-hint phone-error" autoComplete="tel" />
            <div id="phone-hint" className="field-hint">(123) 456-7890</div>
            <div id="phone-error" className="error-message" role="alert" aria-live="polite"></div>
          </div>

          <div className="form-group message-group">
            <label htmlFor="message">
              Message <span className="required" aria-label="required">*</span>
            </label>
            <textarea id="message" name="message" required aria-describedby="message-hint message-error message-counter" placeholder="Give me your best project ideas!"></textarea>
            <div className="message-footer">
              <div id="message-hint" className="field-hint">Drop your message here</div>
              <div id="message-counter" className="character-counter" aria-live="polite">0/50</div>
            </div>
            <div id="message-error" className="error-message" role="alert" aria-live="polite"></div>
          </div>

          <button type="submit" className="submit-button">
            <span className="button-text">Send Message</span>
            <span className="button-spinner" aria-hidden="true"></span>
          </button>
        </form>
      </main>
    </div>
  );
}
