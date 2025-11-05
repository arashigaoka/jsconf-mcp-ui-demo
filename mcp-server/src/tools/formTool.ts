import { createUIResource, type UIResource } from '@mcp-ui/server';
import type { ReservationFormData, AllergyInquiryData } from '../types/index.js';

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
      restaurantName: CONFIG.restaurantName || '',
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

    // Restaurant name field
    const restaurantNameInput = document.createElement('ui-text-input');
    restaurantNameInput.setAttribute('label', '店名');
    restaurantNameInput.setAttribute('name', 'restaurantName');
    restaurantNameInput.setAttribute('placeholder', 'レストラン名を入力');
    restaurantNameInput.setAttribute('required', 'true');
    if (CONFIG.restaurantName) {
      restaurantNameInput.setAttribute('value', CONFIG.restaurantName);
    }
    restaurantNameInput.addEventListener('change', (e) => {
      formState.restaurantName = (e.detail?.value || e.detail || '').toString().trim();
    });
    fieldsStack.appendChild(restaurantNameInput);

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
        restaurantName: formState.restaurantName.trim() || CONFIG.restaurantName,
        name: formState.name.trim(),
        date: formState.date,
        time: formState.time,
        partySize: parsedPartySize,
        contact: formState.contact.trim(),
      };

      // Validate required fields with specific error messages
      const missingFields = [];
      if (!formData.restaurantName) missingFields.push('店名');
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
 * Creates a UIResource for final confirmation message
 */
export function createFinalMessage(allergyInfo: string, restaurantName: string): UIResource {
  const sanitizedAllergy = allergyInfo
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .slice(0, 500);
  const sanitizedName = sanitizeRestaurantName(restaurantName);

  const remoteDomScript = `
    const CONFIG = ${JSON.stringify({ allergyInfo: sanitizedAllergy, restaurantName: sanitizedName })};

    // Create main container stack
    const container = document.createElement('ui-stack');
    container.setAttribute('direction', 'vertical');
    container.setAttribute('gap', '24px');

    // Success icon and message
    const successMessage = document.createElement('ui-text');
    successMessage.setAttribute('fontSize', '18px');
    successMessage.setAttribute('fontWeight', '600');
    successMessage.setAttribute('content', '✓ アレルギー情報を承知いたしました');
    container.appendChild(successMessage);

    // Details
    const details = document.createElement('ui-text');
    details.setAttribute('fontSize', '14px');
    details.setAttribute('color', '#718096');
    details.setAttribute('content', CONFIG.restaurantName + 'では、' + CONFIG.allergyInfo + 'について配慮いたします。当日お店でお伝えください。');
    container.appendChild(details);

    // Thank you message
    const thankYou = document.createElement('ui-text');
    thankYou.setAttribute('fontSize', '14px');
    thankYou.setAttribute('fontWeight', '500');
    thankYou.setAttribute('content', 'ご予約ありがとうございました。');
    thankYou.style.marginTop = '8px';
    container.appendChild(thankYou);

    // Append to root
    root.appendChild(container);
  `;

  const resource = createUIResource({
    uri: `ui://final-message/${Date.now()}`,
    content: {
      type: 'remoteDom',
      script: remoteDomScript,
      framework: 'react',
    },
    encoding: 'text',
  });

  if (resource && typeof resource === 'object') {
    (resource as any).annotations = {
      audience: ['user'],
      priority: 1,
    };
  }

  return resource;
}

/**
 * Creates a UIResource for allergy inquiry form
 */
export function createAllergyInquiryForm(restaurantName: string): UIResource {
  const sanitizedName = sanitizeRestaurantName(restaurantName);

  const remoteDomScript = `
    const CONFIG = ${JSON.stringify({ restaurantName: sanitizedName })};

    // State management for form data
    const formState = {
      allergyInfo: '',
    };

    // Create main container stack
    const container = document.createElement('ui-stack');
    container.setAttribute('direction', 'vertical');
    container.setAttribute('gap', '24px');

    // Title
    const title = document.createElement('ui-text');
    title.setAttribute('fontSize', '24px');
    title.setAttribute('fontWeight', '700');
    title.setAttribute('content', 'アレルギーについて');
    container.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('ui-text');
    subtitle.setAttribute('fontSize', '14px');
    subtitle.setAttribute('color', '#718096');
    subtitle.setAttribute('content', 'アレルギー情報をご記入ください');
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

    // Allergy info field
    const allergyInput = document.createElement('ui-text-input');
    allergyInput.setAttribute('label', 'アレルギー情報');
    allergyInput.setAttribute('name', 'allergyInfo');
    allergyInput.setAttribute('placeholder', '例: 小麦アレルギー');
    allergyInput.setAttribute('required', 'true');
    allergyInput.addEventListener('change', (e) => {
      formState.allergyInfo = (e.detail?.value || e.detail || '').toString().trim();
    });
    fieldsStack.appendChild(allergyInput);

    // Submit button
    const submitButton = document.createElement('ui-button');
    submitButton.setAttribute('label', '送信');
    submitButton.setAttribute('variant', 'solid');
    submitButton.setAttribute('type', 'submit');
    fieldsStack.appendChild(submitButton);

    form.appendChild(fieldsStack);
    container.appendChild(form);

    // Add form submit handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = {
        allergyInfo: formState.allergyInfo.trim(),
        restaurantName: CONFIG.restaurantName,
      };

      // Validate required fields
      if (!formData.allergyInfo) {
        showError('アレルギー情報を入力してください');
        return;
      }

      // Send tool call to parent via postMessage
      const targetOrigin = window.location.ancestorOrigins?.[0] || window.location.origin;
      window.parent.postMessage({
        type: 'tool',
        payload: {
          toolName: 'submit_allergy_inquiry',
          params: formData
        }
      }, targetOrigin);
    });

    // Append to root
    root.appendChild(container);
  `;

  const resource = createUIResource({
    uri: `ui://allergy-inquiry-form/${Date.now()}`,
    content: {
      type: 'remoteDom',
      script: remoteDomScript,
      framework: 'react',
    },
    encoding: 'text',
  });

  if (resource && typeof resource === 'object') {
    (resource as any).annotations = {
      audience: ['user'],
      priority: 1,
    };
  }

  return resource;
}

/**
 * Creates a UIResource for reservation success panel with action buttons
 */
export function createReservationSuccessPanel(restaurantName: string): UIResource {
  const sanitizedName = sanitizeRestaurantName(restaurantName);

  const remoteDomScript = `
    const CONFIG = ${JSON.stringify({ restaurantName: sanitizedName })};

    // Create main container stack
    const container = document.createElement('ui-stack');
    container.setAttribute('direction', 'vertical');
    container.setAttribute('gap', '24px');

    // Success message
    const successMessage = document.createElement('ui-text');
    successMessage.setAttribute('fontSize', '18px');
    successMessage.setAttribute('fontWeight', '600');
    successMessage.setAttribute('content', '予約しました。他に確認したいことはありますか？');
    container.appendChild(successMessage);

    // Action buttons stack
    const buttonsStack = document.createElement('ui-stack');
    buttonsStack.setAttribute('direction', 'horizontal');
    buttonsStack.setAttribute('gap', '12px');
    buttonsStack.style.flexWrap = 'wrap';

    // Allergy inquiry button
    const allergyButton = document.createElement('ui-button');
    allergyButton.setAttribute('label', 'アレルギーについて');
    allergyButton.setAttribute('variant', 'outline');
    allergyButton.addEventListener('press', () => {
      const targetOrigin = window.location.ancestorOrigins?.[0] || window.location.origin;
      window.parent.postMessage({
        type: 'tool',
        payload: {
          toolName: 'ask_allergy',
          params: { restaurantName: CONFIG.restaurantName }
        }
      }, targetOrigin);
    });
    buttonsStack.appendChild(allergyButton);

    // Private room inquiry button
    const privateRoomButton = document.createElement('ui-button');
    privateRoomButton.setAttribute('label', '個室ですか');
    privateRoomButton.setAttribute('variant', 'outline');
    privateRoomButton.addEventListener('press', () => {
      const targetOrigin = window.location.ancestorOrigins?.[0] || window.location.origin;
      window.parent.postMessage({
        type: 'tool',
        payload: {
          toolName: 'ask_private_room',
          params: { restaurantName: CONFIG.restaurantName }
        }
      }, targetOrigin);
    });
    buttonsStack.appendChild(privateRoomButton);

    container.appendChild(buttonsStack);

    // Append to root
    root.appendChild(container);
  `;

  const resource = createUIResource({
    uri: `ui://reservation-success/${Date.now()}`,
    content: {
      type: 'remoteDom',
      script: remoteDomScript,
      framework: 'react',
    },
    encoding: 'text',
  });

  if (resource && typeof resource === 'object') {
    (resource as any).annotations = {
      audience: ['user'],
      priority: 1,
    };
  }

  return resource;
}

/**
 * Handles allergy inquiry submission
 */
export function handleAllergyInquirySubmit(data: AllergyInquiryData): {
  success: boolean;
  message: string;
  data: AllergyInquiryData;
  uiResource: UIResource;
} {
  console.log('Allergy inquiry received:', data);

  // Create final message UI
  const finalMessage = createFinalMessage(data.allergyInfo, data.restaurantName);

  return {
    success: true,
    message: `アレルギー情報（${data.allergyInfo}）を受け付けました。`,
    data,
    uiResource: finalMessage,
  };
}

/**
 * Handles private room inquiry
 */
export function handlePrivateRoomInquiry(restaurantName: string): {
  success: boolean;
  message: string;
  uiResource: UIResource;
} {
  const sanitizedName = sanitizeRestaurantName(restaurantName);

  const remoteDomScript = `
    const CONFIG = ${JSON.stringify({ restaurantName: sanitizedName })};

    // Create main container stack
    const container = document.createElement('ui-stack');
    container.setAttribute('direction', 'vertical');
    container.setAttribute('gap', '24px');

    // Title
    const title = document.createElement('ui-text');
    title.setAttribute('fontSize', '20px');
    title.setAttribute('fontWeight', '700');
    title.setAttribute('content', '個室について');
    container.appendChild(title);

    // Information message
    const infoMessage = document.createElement('ui-text');
    infoMessage.setAttribute('fontSize', '14px');
    infoMessage.setAttribute('color', '#718096');
    infoMessage.setAttribute('content', CONFIG.restaurantName + 'には個室をご用意しております。4名様以上でご利用いただけます。ご希望の場合は、予約時に「個室希望」とお伝えください。');
    container.appendChild(infoMessage);

    // Append to root
    root.appendChild(container);
  `;

  const resource = createUIResource({
    uri: `ui://private-room-info/${Date.now()}`,
    content: {
      type: 'remoteDom',
      script: remoteDomScript,
      framework: 'react',
    },
    encoding: 'text',
  });

  if (resource && typeof resource === 'object') {
    (resource as any).annotations = {
      audience: ['user'],
      priority: 1,
    };
  }

  return {
    success: true,
    message: '個室のご案内を表示しました',
    uiResource: resource,
  };
}

/**
 * Handles reservation submission
 */
export function handleReservationSubmit(data: ReservationFormData): {
  success: boolean;
  message: string;
  data: ReservationFormData;
  uiResource: UIResource;
} {
  // In a real application, this would save to a database
  console.log('Reservation received:', data);

  // Create success panel UI
  const successPanel = createReservationSuccessPanel(data.restaurantName);

  return {
    success: true,
    message: `${data.restaurantName}の予約を受け付けました。\n${data.date} ${data.time}に${data.partySize}名様でご予約承りました。\nご連絡先: ${data.contact}`,
    data,
    uiResource: successPanel,
  };
}
