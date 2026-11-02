// MCP stdio server：对外提供运单查询工具（查询物流轨迹/签收记录/保价金额、温控事件）。
// 模拟"运单系统"作为独立服务被运单核验 Agent 经 MCP 协议调用；数据读 PG（seed 灌入）。
// 注意：stdio 模式下 stdout 只能承载 MCP 协议帧，日志一律走 stderr。
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import '../polyfill.js';
import 'dotenv/config';
import { getShipment } from '../db/repo.js';

const server = new McpServer({ name: 'waybill-mcp', version: '1.0.0' });

server.tool(
  'query_track',
  '查询运单物流轨迹、签收记录与保价金额',
  { waybill_no: z.string().describe('运单号') },
  async ({ waybill_no }) => {
    const s = await getShipment(waybill_no);
    if (!s) return { content: [{ type: 'text', text: JSON.stringify({ found: false, waybillNo: waybill_no }) }] };
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          found: true,
          waybillNo: s.waybillNo,
          route: s.route,
          goodsDesc: s.goodsDesc,
          insuredAmount: s.insuredAmount,
          signedAt: s.signedAt,
          signedBy: s.signedBy,
          events: s.events,
        }),
      }],
    };
  },
);

server.tool(
  'query_temperature_events',
  '查询冷链运单的温控事件（生鲜件适用）',
  { waybill_no: z.string().describe('运单号') },
  async ({ waybill_no }) => {
    const s = await getShipment(waybill_no);
    if (!s) return { content: [{ type: 'text', text: JSON.stringify({ found: false, waybillNo: waybill_no }) }] };
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ found: true, waybillNo: s.waybillNo, temperatureEvents: s.temperatureEvents }),
      }],
    };
  },
);

await server.connect(new StdioServerTransport());
console.error('[waybill-mcp] stdio server ready');
