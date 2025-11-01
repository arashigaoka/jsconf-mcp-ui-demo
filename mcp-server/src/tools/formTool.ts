import { createUIResource, type UIResource } from '@mcp-ui/server';
import type { ReservationFormData } from '../types/index.js';

/**
 * Creates a UIResource for restaurant reservation form
 */
export function createReservationForm(restaurantName: string): UIResource {
  const htmlString = `
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            padding: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }

          .container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          h2 {
            color: #1a202c;
            margin-bottom: 8px;
            font-size: 28px;
            font-weight: 700;
          }

          .subtitle {
            color: #718096;
            margin-bottom: 24px;
            font-size: 14px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2d3748;
            font-size: 14px;
          }

          input, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 15px;
            transition: all 0.2s;
            font-family: inherit;
          }

          input:focus, select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          input::placeholder {
            color: #a0aec0;
          }

          button {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 8px;
          }

          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          }

          button:active {
            transform: translateY(0);
          }

          .restaurant-name {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2><span class="restaurant-name">${restaurantName}</span> の予約</h2>
          <p class="subtitle">以下のフォームにご記入ください</p>

          <form id="reservationForm">
            <div class="form-group">
              <label for="name">お名前 *</label>
              <input type="text" id="name" name="name" required placeholder="山田 太郎">
            </div>

            <div class="form-group">
              <label for="date">ご希望日 *</label>
              <input type="date" id="date" name="date" required>
            </div>

            <div class="form-group">
              <label for="time">ご希望時間 *</label>
              <input type="time" id="time" name="time" required>
            </div>

            <div class="form-group">
              <label for="partySize">人数 *</label>
              <select id="partySize" name="partySize" required>
                <option value="">選択してください</option>
                <option value="1">1名</option>
                <option value="2">2名</option>
                <option value="3">3名</option>
                <option value="4">4名</option>
                <option value="5">5名</option>
                <option value="6">6名</option>
                <option value="7">7名</option>
                <option value="8">8名</option>
                <option value="9">9名</option>
                <option value="10">10名以上</option>
              </select>
            </div>

            <div class="form-group">
              <label for="contact">連絡先（電話番号またはメール）*</label>
              <input type="text" id="contact" name="contact" required placeholder="090-1234-5678">
            </div>

            <button type="submit">予約する</button>
          </form>
        </div>

        <script>
          document.getElementById('reservationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
              name: formData.get('name'),
              date: formData.get('date'),
              time: formData.get('time'),
              partySize: parseInt(formData.get('partySize')),
              contact: formData.get('contact'),
              restaurantName: '${restaurantName}'
            };

            // postMessageでホストに送信
            window.parent.postMessage({
              type: 'tool',
              payload: {
                toolName: 'submit_reservation',
                params: data
              }
            }, '*');
          });

          // 日付の最小値を今日に設定
          const today = new Date().toISOString().split('T')[0];
          document.getElementById('date').setAttribute('min', today);
        </script>
      </body>
    </html>
  `;

  const resource = createUIResource({
    uri: `ui://reservation-form/${Date.now()}`,
    content: {
      type: 'rawHtml',
      htmlString,
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
