import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import {
  createReservationForm,
  handleReservationSubmit,
  createAllergyInquiryForm,
  handleAllergyInquirySubmit,
  handlePrivateRoomInquiry,
} from './tools/formTool.js';
import type { ReservationFormData, AllergyInquiryData, ToolResponse } from './types/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.MCP_PORT || 3001;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'MCP Server is running',
    timestamp: new Date().toISOString(),
    phase: 'Phase 2 - MCP Server Implementation',
  });
});

// List available tools
app.get('/tools', (_req: Request, res: Response) => {
  res.json({
    tools: [
      {
        name: 'show_reservation_form',
        description: 'Display restaurant reservation form',
        parameters: {
          type: 'object',
          properties: {
            restaurantName: {
              type: 'string',
              description: 'Name of the restaurant (defaults to "レストラン" if not provided)',
              default: 'レストラン',
            },
          },
          required: [],
        },
      },
      {
        name: 'submit_reservation',
        description: 'Submit reservation data',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Customer name' },
            date: { type: 'string', description: 'Reservation date (YYYY-MM-DD)' },
            time: { type: 'string', description: 'Reservation time (HH:MM)' },
            partySize: { type: 'number', description: 'Number of guests' },
            contact: { type: 'string', description: 'Contact information' },
            restaurantName: { type: 'string', description: 'Restaurant name' },
          },
          required: ['name', 'date', 'time', 'partySize', 'contact', 'restaurantName'],
        },
      },
      {
        name: 'ask_allergy',
        description: 'Display allergy inquiry form',
        parameters: {
          type: 'object',
          properties: {
            restaurantName: {
              type: 'string',
              description: 'Name of the restaurant',
            },
          },
          required: ['restaurantName'],
        },
      },
      {
        name: 'ask_private_room',
        description: 'Show information about private rooms',
        parameters: {
          type: 'object',
          properties: {
            restaurantName: {
              type: 'string',
              description: 'Name of the restaurant',
            },
          },
          required: ['restaurantName'],
        },
      },
      {
        name: 'submit_allergy_inquiry',
        description: 'Submit allergy inquiry',
        parameters: {
          type: 'object',
          properties: {
            allergyInfo: { type: 'string', description: 'Allergy information' },
            restaurantName: { type: 'string', description: 'Restaurant name' },
          },
          required: ['allergyInfo', 'restaurantName'],
        },
      },
    ],
  });
});

// Tool execution endpoint
app.post('/tools/show_reservation_form', (req: Request, res: Response) => {
  try {
    const { restaurantName = 'レストラン' } = req.body;

    // createUIResource already returns an EmbeddedResource format
    const uiResource = createReservationForm(restaurantName as string);

    res.json({
      success: true,
      message: 'Reservation form generated',
      uiResource,
    });
  } catch (error) {
    console.error('Error in show_reservation_form:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ToolResponse);
  }
});

app.post('/tools/submit_reservation', (req: Request, res: Response) => {
  try {
    const { name, date, time, partySize, contact, restaurantName } = req.body;

    // Validate required fields
    if (!name || !date || !time || !partySize || !contact || !restaurantName) {
      res.status(400).json({
        success: false,
        error: 'All fields are required',
      } as ToolResponse);
      return;
    }

    const formData: ReservationFormData = {
      name,
      date,
      time,
      partySize: parseInt(partySize),
      contact,
      restaurantName,
    };

    const result = handleReservationSubmit(formData);

    // Ensure uiResource is included in the response
    const response: ToolResponse = {
      success: result.success,
      message: result.message,
      data: result.data,
      uiResource: result.uiResource,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in submit_reservation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ToolResponse);
  }
});

app.post('/tools/ask_allergy', (req: Request, res: Response) => {
  try {
    const { restaurantName = 'レストラン' } = req.body;

    const uiResource = createAllergyInquiryForm(restaurantName as string);

    res.json({
      success: true,
      message: 'アレルギー問い合わせフォームを表示しました',
      uiResource,
    });
  } catch (error) {
    console.error('Error in ask_allergy:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ToolResponse);
  }
});

app.post('/tools/ask_private_room', (req: Request, res: Response) => {
  try {
    const { restaurantName = 'レストラン' } = req.body;

    const result = handlePrivateRoomInquiry(restaurantName as string);

    res.json(result);
  } catch (error) {
    console.error('Error in ask_private_room:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ToolResponse);
  }
});

app.post('/tools/submit_allergy_inquiry', (req: Request, res: Response) => {
  try {
    const { allergyInfo, restaurantName } = req.body;

    // Validate required fields
    if (!allergyInfo || !restaurantName) {
      res.status(400).json({
        success: false,
        error: 'All fields are required',
      } as ToolResponse);
      return;
    }

    const formData: AllergyInquiryData = {
      allergyInfo,
      restaurantName,
    };

    const result = handleAllergyInquirySubmit(formData);

    res.json(result);
  } catch (error) {
    console.error('Error in submit_allergy_inquiry:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ToolResponse);
  }
});

// Generic tool call endpoint (for MCP protocol compatibility)
app.post('/tools/:toolName', (req: Request, res: Response) => {
  const { toolName } = req.params;
  const params = req.body;

  // Route to specific handlers
  if (toolName === 'show_reservation_form') {
    return app._router.handle(
      Object.assign(req, { url: '/tools/show_reservation_form', method: 'POST' }),
      res,
      () => {}
    );
  } else if (toolName === 'submit_reservation') {
    return app._router.handle(
      Object.assign(req, { url: '/tools/submit_reservation', method: 'POST' }),
      res,
      () => {}
    );
  } else if (toolName === 'ask_allergy') {
    return app._router.handle(
      Object.assign(req, { url: '/tools/ask_allergy', method: 'POST' }),
      res,
      () => {}
    );
  } else if (toolName === 'ask_private_room') {
    return app._router.handle(
      Object.assign(req, { url: '/tools/ask_private_room', method: 'POST' }),
      res,
      () => {}
    );
  } else if (toolName === 'submit_allergy_inquiry') {
    return app._router.handle(
      Object.assign(req, { url: '/tools/submit_allergy_inquiry', method: 'POST' }),
      res,
      () => {}
    );
  }

  res.status(404).json({
    success: false,
    error: `Tool ${toolName} not found`,
  } as ToolResponse);
});

// Start server
app.listen(PORT, () => {
  console.log(`🔧 MCP Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🛠️  Tools endpoint: http://localhost:${PORT}/tools`);
  console.log(`\n✨ Available tools:`);
  console.log(`   - show_reservation_form: Display restaurant reservation form`);
  console.log(`   - submit_reservation: Submit reservation data`);
  console.log(`   - ask_allergy: Display allergy inquiry form`);
  console.log(`   - ask_private_room: Show information about private rooms`);
  console.log(`   - submit_allergy_inquiry: Submit allergy inquiry`);
});
