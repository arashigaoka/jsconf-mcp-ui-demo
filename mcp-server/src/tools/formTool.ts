import { createUIResource, type UIResource } from '@mcp-ui/server';
import type { ReservationFormData } from '../types/index.js';

/**
 * Sanitize restaurant name to prevent XSS attacks
 */
function sanitizeRestaurantName(name: string): string {
  return name
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .slice(0, 100); // Length limit
}

/**
 * Creates a UIResource for restaurant reservation form using Remote DOM
 */
export function createReservationForm(restaurantName: string): UIResource {
  // Sanitize input to prevent XSS
  const sanitizedName = sanitizeRestaurantName(restaurantName);

  // Remote DOM script that builds the UI structure
  const remoteDomScript = `
    // Configuration object for safe data injection
    const CONFIG = ${JSON.stringify({ restaurantName: sanitizedName })};

    // State management for form data
    const formState = {
      name: '',
      date: '',
      time: '',
      partySize: '',
      contact: '',
    };

    // Create main container stack
    const container = document.createElement('ui-stack');
    container.setAttribute('direction', 'vertical');
    container.setAttribute('gap', '24px');

    // Title
    const title = document.createElement('ui-text');
    title.setAttribute('fontSize', '28px');
    title.setAttribute('fontWeight', '700');
    title.setAttribute('content', CONFIG.restaurantName + ' の予約');
    container.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('ui-text');
    subtitle.setAttribute('fontSize', '14px');
    subtitle.setAttribute('color', '#718096');
    subtitle.setAttribute('content', '以下のフォームにご記入ください');
    container.appendChild(subtitle);

    // Separator
    const separator = document.createElement('ui-separator');
    container.appendChild(separator);

    // Form
    const form = document.createElement('ui-form');

    // Error message container
    const errorContainer = document.createElement('ui-text');
    errorContainer.setAttribute('color', '#e53e3e');
    errorContainer.setAttribute('fontSize', '14px');
    errorContainer.setAttribute('fontWeight', '500');
    errorContainer.style.display = 'none';
    errorContainer.style.padding = '12px';
    errorContainer.style.backgroundColor = '#fff5f5';
    errorContainer.style.border = '1px solid #feb2b2';
    errorContainer.style.borderRadius = '8px';
    errorContainer.style.marginBottom = '16px';

    function showError(message) {
      errorContainer.setAttribute('content', '⚠️ ' + message);
      errorContainer.style.display = 'block';
      setTimeout(() => {
        errorContainer.style.display = 'none';
      }, 5000);
    }

    container.appendChild(errorContainer);

    // Form fields stack
    const fieldsStack = document.createElement('ui-stack');
    fieldsStack.setAttribute('direction', 'vertical');
    fieldsStack.setAttribute('gap', '20px');

    // Name field
    const nameInput = document.createElement('ui-text-input');
    nameInput.setAttribute('label', 'お名前');
    nameInput.setAttribute('name', 'name');
    nameInput.setAttribute('placeholder', '山田 太郎');
    nameInput.setAttribute('required', 'true');
    nameInput.addEventListener('change', (e) => {
      formState.name = (e.detail?.value || e.detail || '').toString().trim();
    });
    fieldsStack.appendChild(nameInput);

    // Date field
    const dateInput = document.createElement('ui-text-input');
    dateInput.setAttribute('label', 'ご希望日');
    dateInput.setAttribute('name', 'date');
    dateInput.setAttribute('type', 'date');
    dateInput.setAttribute('required', 'true');
    dateInput.addEventListener('change', (e) => {
      formState.date = (e.detail?.value || e.detail || '').toString();
    });
    fieldsStack.appendChild(dateInput);

    // Time field
    const timeInput = document.createElement('ui-text-input');
    timeInput.setAttribute('label', 'ご希望時間');
    timeInput.setAttribute('name', 'time');
    timeInput.setAttribute('type', 'time');
    timeInput.setAttribute('required', 'true');
    timeInput.addEventListener('change', (e) => {
      formState.time = (e.detail?.value || e.detail || '').toString();
    });
    fieldsStack.appendChild(timeInput);

    // Party size field (select)
    const partySizeSelect = document.createElement('ui-select');
    partySizeSelect.setAttribute('label', '人数');
    partySizeSelect.setAttribute('name', 'partySize');
    partySizeSelect.setAttribute('placeholder', '選択してください');
    partySizeSelect.setAttribute('required', 'true');
    partySizeSelect.setAttribute('options', JSON.stringify([
      { value: '1', label: '1名' },
      { value: '2', label: '2名' },
      { value: '3', label: '3名' },
      { value: '4', label: '4名' },
      { value: '5', label: '5名' },
      { value: '6', label: '6名' },
      { value: '7', label: '7名' },
      { value: '8', label: '8名' },
      { value: '9', label: '9名' },
      { value: '10', label: '10名以上' },
    ]));
    partySizeSelect.addEventListener('change', (e) => {
      formState.partySize = (e.detail?.value || e.detail || '').toString();
    });
    fieldsStack.appendChild(partySizeSelect);

    // Contact field
    const contactInput = document.createElement('ui-text-input');
    contactInput.setAttribute('label', '連絡先（電話番号またはメール）');
    contactInput.setAttribute('name', 'contact');
    contactInput.setAttribute('placeholder', '090-1234-5678');
    contactInput.setAttribute('required', 'true');
    contactInput.addEventListener('change', (e) => {
      formState.contact = (e.detail?.value || e.detail || '').toString().trim();
    });
    fieldsStack.appendChild(contactInput);

    // Submit button
    const submitButton = document.createElement('ui-button');
    submitButton.setAttribute('label', '予約する');
    submitButton.setAttribute('variant', 'solid');
    submitButton.setAttribute('type', 'submit');
    fieldsStack.appendChild(submitButton);

    form.appendChild(fieldsStack);
    container.appendChild(form);

    // Add form submit handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate and parse partySize
      const parsedPartySize = parseInt(formState.partySize);
      if (isNaN(parsedPartySize) || parsedPartySize < 1) {
        showError('人数を選択してください');
        return;
      }

      // Use collected form state
      const formData = {
        name: formState.name.trim(),
        date: formState.date,
        time: formState.time,
        partySize: parsedPartySize,
        contact: formState.contact.trim(),
        restaurantName: CONFIG.restaurantName
      };

      // Validate required fields with specific error messages
      const missingFields = [];
      if (!formData.name) missingFields.push('お名前');
      if (!formData.date) missingFields.push('ご希望日');
      if (!formData.time) missingFields.push('ご希望時間');
      if (!formData.partySize) missingFields.push('人数');
      if (!formData.contact) missingFields.push('連絡先');

      if (missingFields.length > 0) {
        showError('以下の項目を入力してください: ' + missingFields.join(', '));
        return;
      }

      // Validate date
      const dateObj = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(dateObj.getTime())) {
        showError('有効な日付を入力してください');
        return;
      }

      if (dateObj < today) {
        showError('過去の日付は選択できません');
        return;
      }

      const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      if (dateObj > oneYearFromNow) {
        showError('予約は1年先まで可能です');
        return;
      }

      // Enhanced contact validation
      const contactValue = formData.contact;
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      const phoneRegex = /^[\\d\\-\\+\\(\\)\\s]{10,20}$/;

      const isEmail = emailRegex.test(contactValue);
      const isPhone = phoneRegex.test(contactValue) && contactValue.replace(/\\D/g, '').length >= 10;

      if (!isEmail && !isPhone) {
        showError('連絡先には有効な電話番号（10桁以上）またはメールアドレスを入力してください');
        return;
      }

      // Send tool call to parent via postMessage (correct way for iframe communication)
      // Use specific origin instead of wildcard for security
      const targetOrigin = window.location.ancestorOrigins?.[0] || window.location.origin;
      window.parent.postMessage({
        type: 'tool',
        payload: {
          toolName: 'submit_reservation',
          params: formData
        }
      }, targetOrigin);
    });

    // Append to root
    root.appendChild(container);
  `;

  const resource = createUIResource({
    uri: `ui://reservation-form/${Date.now()}`,
    content: {
      type: 'remoteDom',
      script: remoteDomScript,
      framework: 'react',
    },
    encoding: 'text',
  });

  // Add annotations to specify content type for UIResourceRenderer
  if (resource && typeof resource === 'object') {
    (resource as any).annotations = {
      audience: ['user'],
      priority: 1,
    };
  }

  return resource;
}

/**
 * Handles reservation submission
 */
export function handleReservationSubmit(data: ReservationFormData): {
  success: boolean;
  message: string;
  data: ReservationFormData;
} {
  // In a real application, this would save to a database
  console.log('Reservation received:', data);

  return {
    success: true,
    message: `${data.restaurantName}の予約を受け付けました。\n${data.date} ${data.time}に${data.partySize}名様でご予約承りました。\nご連絡先: ${data.contact}`,
    data,
  };
}
